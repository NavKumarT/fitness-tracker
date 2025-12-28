import { useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useWorkoutStore } from '../stores/workoutStores';
import { getExercisesForTrainingUnit, UnitExercise } from '../db/trainingUnitExercises';
import {
  getActiveTrainingSchedule,
} from '../db/trainingSchedules';
import {
  resolveTrainingUnitForToday,
  resolveNextTrainingUnit,
} from '../db/trainingUnits';
import {
  hasCompletedWorkoutToday,
  getLastCompletedWorkoutId,
  isWorkoutEmpty,
  hasCompletedWorkoutForScheduleToday,
} from '../db/workouts';
import { getWorkoutSummary } from '../db/workoutSummary';

export type HomeState =
  | 'NEW_USER'
  | 'ACTIVE_WORKOUT'
  | 'TODAY_WORKOUT'
  | 'TODAY_REST'
  | 'TODAY_COMPLETE';

export type HomeStateResult = {
  state: HomeState;
  todayUnit?: {
    label: string;
    exercises: UnitExercise[];
  };
  todaySummary?: {
    durationMinutes: number;
    setCount: number;
  };
  nextUnit?: {
    label: string;
    exercises: UnitExercise[];
    date?: Date; // Added date
  };
};

export function useHomeState(): HomeStateResult {
  const isFocused = useIsFocused();
  const activeWorkoutId = useWorkoutStore((s) => s.activeWorkoutId);

  // Default to NEW_USER initially to avoid flash, or allow null/loading
  const [result, setResult] = useState<HomeStateResult>({ state: 'NEW_USER' });

  const refreshState = useCallback(() => {
    // 1️⃣ Active workout always wins (UNLESS it's empty/accidental)
    if (activeWorkoutId && !isWorkoutEmpty(activeWorkoutId)) {
      setResult({ state: 'ACTIVE_WORKOUT' });
      return;
    }

    // 2️⃣ Resolve active schedule
    const schedule = getActiveTrainingSchedule();

    if (!schedule) {
      setResult({ state: 'NEW_USER' });
      return;
    }

    // 🆕 Always resolve next unit (for display on rest days / complete)
    const nextResult = resolveNextTrainingUnit(
      schedule.id,
      schedule.current_index,
      schedule.type
    );

    let nextUnitData;
    if (nextResult) {
      const { unit, daysAway } = nextResult;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysAway);

      nextUnitData = {
        label: unit.label ?? 'Next Workout',
        exercises: getExercisesForTrainingUnit(unit.id),
        date: nextDate
      };
    }

    // 3️⃣ Resolve today’s training unit
    const todayUnit = resolveTrainingUnitForToday(schedule);

    // 4️⃣ Check if specifically TODAY'S unit is completed
    // If today is a rest day (todayUnit is null/rest), we strictly respect that status
    // unless we want ad-hoc to override rest? 
    // For now, let's fix the reported bug: Scheduled Day + AdHoc != Complete.

    // We only consider it "Complete" if the SPECIFIC unit was done.
    // We only consider it "Complete" if the SPECIFIC unit was done.
    // For Cycle schedules, we check if ANY unit for the schedule was done today.
    let isComplete = false;

    if (schedule.type === 'cycle') {
      if (hasCompletedWorkoutForScheduleToday(schedule.id)) {
        isComplete = true;
      }
    } else if (todayUnit && !todayUnit.is_rest) {
      if (hasCompletedWorkoutToday(todayUnit.id)) {
        isComplete = true;
      }
    }

    if (isComplete) {
      const workoutId = getLastCompletedWorkoutId();
      const summary = workoutId ? getWorkoutSummary(workoutId) : null;

      // 🟢 FIX: For Cycle schedules, because startWorkoutFromTemplate advances the index immediately,
      // the "Next" unit calculated above (using current_index) is actually +2 days ahead.
      // We need to calculate it from (current_index - 1) to get the actual next day.
      if (schedule.type === 'cycle') {
        const correctedNext = resolveNextTrainingUnit(
          schedule.id,
          schedule.current_index - 1,
          'cycle'
        );
        if (correctedNext) {
          const { unit, daysAway } = correctedNext;
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + daysAway);

          nextUnitData = {
            label: unit.label ?? 'Next Workout',
            exercises: getExercisesForTrainingUnit(unit.id),
            date: nextDate
          };
        }
      }

      setResult({
        state: 'TODAY_COMPLETE',
        todaySummary: summary
          ? {
            durationMinutes: summary.durationMinutes,
            setCount: summary.setCount,
          }
          : undefined,
        nextUnit: nextUnitData,
      });
      return;
    }


    // 5️⃣ Handle Rest Day
    if (!todayUnit || todayUnit.is_rest === 1) {
      setResult({
        state: 'TODAY_REST',
        nextUnit: nextUnitData,
      });
      return;
    }

    // 6️⃣ Scheduled Day (Not Complete)
    setResult({
      state: 'TODAY_WORKOUT',
      todayUnit: {
        label: todayUnit.label ?? 'Workout',
        exercises: getExercisesForTrainingUnit(todayUnit.id),
      },
    });
  }, [activeWorkoutId]);

  useEffect(() => {
    if (isFocused) {
      refreshState();
    }
  }, [isFocused, refreshState]);

  return result;
}

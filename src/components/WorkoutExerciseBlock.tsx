import { View, Text, TextInput, Pressable, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';

import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { formatWeight, toKg } from '../utils/units';
import {
  getSetsForWorkoutExercise,
  addSet,
  updateSet,
  deleteSet,
} from '../db/workoutSets';
import type { WorkoutSet } from '../db/types';
import { getPersonalRecord } from '../db/stats';

import ExerciseIcon from './ExerciseIcon';
import SetInput from './SetInput';

type Props = {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  muscle?: string;
  imageUrl?: string;
};

export default function WorkoutExerciseBlock({
  workoutExerciseId,
  exerciseId,
  exerciseName,
  muscle,
  imageUrl,
}: Props) {
  const colors = useThemeStore((s) => s.colors);
  const weightUnit = useUserStore((s) => s.weightUnit);

  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [personalRecord, setPersonalRecord] = useState(0);

  useEffect(() => {
    setSets(getSetsForWorkoutExercise(workoutExerciseId));
    // Fetch PR for this exercise type
    const pr = getPersonalRecord(exerciseId);
    setPersonalRecord(pr);
  }, [workoutExerciseId, exerciseId]);

  const [collapsed, setCollapsed] = useState(false);

  function handleAddSet() {
    const newSet = addSet(workoutExerciseId);
    setSets((prev) => [...prev, newSet]);
    setCollapsed(false); // auto-expand
  }

  function handleUpdate(
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) {
    let parsed = value === '' ? null : Number(value);

    // If updating weight, convert from Display Unit to KG for storage
    if (field === 'weight' && parsed !== null) {
      parsed = toKg(parsed, weightUnit);
    }

    updateSet(setId, { [field]: parsed });

    setSets((prev) =>
      prev.map((s) =>
        s.id === setId ? { ...s, [field]: parsed } : s
      )
    );
  }

  function handleDelete(setId: string) {
    deleteSet(setId);
    setSets(getSetsForWorkoutExercise(workoutExerciseId));
  }

  return (
    <View style={{
      marginBottom: spacing[8],
      paddingBottom: spacing[6],
      borderBottomWidth: 1,
      borderBottomColor: colors.bg.tertiary
    }}>
      {/* Exercise name */}
      <Pressable
        onPress={() => setCollapsed(!collapsed)}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {muscle && (
            <View style={{ marginRight: spacing[3] }}>
              <ExerciseIcon muscle={muscle} name={exerciseName} imageUrl={imageUrl} size={36} />
            </View>
          )}
          <View>
            <Text
              style={[
                typography.h2,
                { color: colors.text.primary },
              ]}
            >
              {exerciseName}
            </Text>
            {personalRecord > 0 && (
              <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 2 }}>
                History PR: {formatWeight(personalRecord, weightUnit, true)}
              </Text>
            )}
          </View>
        </View>
        <Text style={{ ...typography.caption, color: colors.text.muted }}>
          {collapsed ? 'Show' : 'Hide'}
        </Text>
      </Pressable>

      {/* Sets */}
      {!collapsed && sets.map((set) => {
        const isPR = personalRecord > 0 && (set.weight || 0) > personalRecord;

        return (
          <View
            key={set.id}
            style={{
              marginTop: spacing[4],
              padding: spacing[4],
              backgroundColor: isPR ? colors.bg.tertiary : colors.bg.secondary,
              borderRadius: radius.md,
              borderWidth: isPR ? 1 : 0,
              borderColor: isPR ? colors.accent.primary : 'transparent',
            }}
          >
            {/* Set label + Bodyweight Toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
              <Text
                style={{
                  ...typography.caption,
                  color: isPR ? colors.accent.primary : colors.text.muted,
                  fontWeight: isPR ? 'bold' : 'normal'
                }}
              >
                Set {set.set_index + 1} {isPR ? " • NEW PR! 🏆" : ""}
              </Text>

              {/* Bodyweight Toggle */}
              <Pressable
                onPress={() => handleUpdate(set.id, 'weight', (set.weight === 0) ? '' : '0')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                hitSlop={8}
              >
                <Text style={{ ...typography.caption, color: (set.weight === 0) ? colors.text.primary : colors.text.muted, marginRight: spacing[2], fontSize: 12 }}>
                  Bodyweight
                </Text>
                <View style={{
                  width: 18, height: 18,
                  borderRadius: 4,
                  borderWidth: (set.weight === 0) ? 0 : 1,
                  borderColor: colors.border.subtle,
                  backgroundColor: (set.weight === 0) ? colors.accent.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(set.weight === 0) && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </Pressable>
            </View>

            {/* Inputs row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 45 // Fixed height to prevent layout shift
              }}
            >
              {/* Weight Group */}
              <View>
                {/* Input OR Static BW Text */}
                {(set.weight === 0) ? (
                  <View style={{ justifyContent: 'center', minWidth: 70 }}>
                    <Text style={{ ...typography.h2, color: colors.text.primary }}>BW</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <SetInput
                      // Use Key to force re-render if unit changes, ensuring defaultValue updates
                      key={`weight-${set.id}-${weightUnit}`}
                      initialValue={set.weight ? formatWeight(set.weight, weightUnit) : ''}
                      onCommit={(val) => handleUpdate(set.id, 'weight', val)}
                      allowDecimals={true}
                      placeholder="0"
                      placeholderTextColor={colors.text.muted}
                      style={{
                        ...typography.h2,
                        minWidth: 70,
                        paddingVertical: spacing[2],
                        color: isPR ? colors.accent.primary : colors.text.primary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.bg.tertiary,
                      }}
                    />
                    <Text
                      style={{
                        marginLeft: spacing[1],
                        ...typography.body,
                        color: colors.text.muted,
                      }}
                    >
                      {weightUnit}
                    </Text>
                  </View>
                )}
              </View>

              {/* Spacer */}
              <View style={{ width: spacing[6] }} />

              {/* Reps */}
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <SetInput
                  initialValue={set.reps?.toString() ?? ''}
                  onCommit={(val) => handleUpdate(set.id, 'reps', val)}
                  allowDecimals={false}
                  placeholder="0"
                  placeholderTextColor={colors.text.muted}
                  style={{
                    ...typography.body,
                    minWidth: 40,
                    paddingVertical: spacing[2],
                    color: colors.text.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.bg.tertiary,
                  }}
                />
                <Text
                  style={{
                    marginLeft: spacing[1],
                    ...typography.caption,
                    color: colors.text.muted,
                  }}
                >
                  reps
                </Text>
              </View>

              {/* Delete */}
              <Pressable
                onPress={() => handleDelete(set.id)}
                style={{ marginLeft: 'auto' }}
              >
                <Text
                  style={{
                    ...typography.caption,
                    color: colors.semantic.error,
                  }}
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        )
      })}

      {/* Add set */}
      {!collapsed && (
        <Pressable
          onPress={handleAddSet}
          style={{ marginTop: spacing[5] }}
        >
          <Text
            style={{
              ...typography.body,
              color: colors.accent.primary,
            }}
          >
            + Add set
          </Text>
        </Pressable>
      )}

      {collapsed && (
        <Text style={{ marginTop: spacing[2], color: colors.text.muted, ...typography.caption }}>
          {sets.length} sets logged
        </Text>
      )}
    </View>
  );
}

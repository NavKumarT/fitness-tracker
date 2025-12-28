import { View, Text } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import Screen from '../components/Screen';
import ExerciseSelection from '../app/ExerciseSelection';

import { spacing, typography, colors } from '../theme/tokens';
import { getActiveTrainingSchedule } from '../db/trainingSchedules';
import { getWeeklyWorkoutUnits } from '../db/trainingUnits';

export default function WeeklyExerciseSetup() {
  const navigation = useNavigation();

  const schedule = getActiveTrainingSchedule();
  const units = schedule
    ? getWeeklyWorkoutUnits(schedule.id)
    : [];

  const [index, setIndex] = useState(0);
  const currentUnit = units[index];

  if (!currentUnit) {
    // All done
    navigation.navigate('Home' as never);
    return null;
  }

  function handleDone() {
    if (index < units.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.navigate('Home' as never);
    }
  }

  return (
    <Screen>
      <View style={{ padding: spacing[5], flex: 1 }}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          {currentUnit.label ?? 'Workout'}
        </Text>

        <Text
          style={{
            marginTop: spacing[2],
            ...typography.body,
            color: colors.text.muted,
          }}
        >
          Select exercises for this day
        </Text>

        <View style={{ flex: 1, marginTop: spacing[5] }}>
          <ExerciseSelection
            trainingUnitId={currentUnit.id}
            onDone={handleDone}
          />
        </View>
      </View>
    </Screen>
  );
}

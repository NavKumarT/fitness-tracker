import { View, Text, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import Screen from '../components/Screen';
import { typography, spacing, colors } from '../theme/tokens';
import { getWorkoutSummary } from '../db/workoutSummary';

export default function WorkoutSummary() {
  const route = useRoute<any>();
  const navigation = useNavigation();

  const workoutId = route.params?.workoutId;

  if (!workoutId) {
    return (
      <Screen>
        <View style={{ padding: spacing[6] }}>
          <Text
            style={[
              typography.body,
              { color: colors.text.muted },
            ]}
          >
            Unable to load workout summary.
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Home' as never)}
            style={{ marginTop: spacing[6] }}
          >
            <Text
              style={{
                ...typography.body,
                color: colors.accent.primary,
              }}
            >
              Go Home
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const summary = getWorkoutSummary(workoutId);

  return (
    <Screen>
      <View style={{ padding: spacing[6] }}>
        {/* Title */}
        <Text
          style={[
            typography.h1,
            { color: colors.text.primary },
          ]}
        >
          Workout Complete
        </Text>

        {/* Duration */}
        <View style={{ marginTop: spacing[6] }}>
          <Text
            style={[
              typography.caption,
              { color: colors.text.muted },
            ]}
          >
            Duration
          </Text>
          <Text
            style={[
              typography.h2,
              { color: colors.text.primary },
            ]}
          >
            {summary.durationMinutes} min
          </Text>
        </View>

        {/* Exercises */}
        <View style={{ marginTop: spacing[5] }}>
          <Text
            style={[
              typography.caption,
              { color: colors.text.muted },
            ]}
          >
            Exercises
          </Text>
          <Text
            style={[
              typography.h2,
              { color: colors.text.primary },
            ]}
          >
            {summary.exerciseCount}
          </Text>
        </View>

        {/* Sets */}
        <View style={{ marginTop: spacing[5] }}>
          <Text
            style={[
              typography.caption,
              { color: colors.text.muted },
            ]}
          >
            Sets logged
          </Text>
          <Text
            style={[
              typography.h2,
              { color: colors.text.primary },
            ]}
          >
            {summary.setCount}
          </Text>
        </View>

        {/* Done */}
        <Pressable
          onPress={() => navigation.navigate('Home' as never)}
          style={{ marginTop: spacing[8] }}
        >
          <Text
            style={{
              ...typography.body,
              color: colors.accent.primary,
              textAlign: 'center',
            }}
          >
            Done
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

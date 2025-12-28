import { View, Text, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMemo } from 'react';

import Screen from '../components/Screen';
import { getWorkoutDetail, getWorkoutById } from '../db/history';
import { typography, spacing, colors, radius } from '../theme/tokens';
import { useUserStore } from '../stores/userStore';
import { formatWeight } from '../utils/units';

type SetRow = {
  exercise: string;
  weight: number;
  reps: number;
  set_index: number;
};

export default function WorkoutHistoryDetail() {
  const route = useRoute<any>();
  const { workoutId } = route.params;
  const weightUnit = useUserStore((s) => s.weightUnit);

  const workout = getWorkoutById(workoutId);
  const rows = getWorkoutDetail(workoutId);

  // Group by exercise
  const exercises = useMemo(() => {
    const groups: { name: string; sets: SetRow[] }[] = [];
    let currentGroup: { name: string; sets: SetRow[] } | null = null;

    rows.forEach((row) => {
      if (!currentGroup || currentGroup.name !== row.exercise) {
        currentGroup = { name: row.exercise, sets: [] };
        groups.push(currentGroup);
      }
      currentGroup.sets.push(row);
    });

    return groups;
  }, [rows]);

  if (!workout) return null;

  const durationMin =
    workout.ended_at && workout.started_at
      ? Math.round((workout.ended_at - workout.started_at) / 60000)
      : 0;

  const dateLabel = new Date(workout.started_at).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[8] }}>
        {/* Header */}
        <View style={{ marginBottom: spacing[6] }}>
          <Text style={[typography.h1, { color: colors.text.primary }]}>
            {dateLabel}
          </Text>
          <Text
            style={{
              marginTop: spacing[2],
              ...typography.body,
              color: colors.text.muted,
            }}
          >
            {durationMin} min duration • {exercises.length} exercises
          </Text>
        </View>

        {/* Exercises */}
        {exercises.map((group, idx) => (
          <View
            key={idx}
            style={{
              marginBottom: spacing[5],
              backgroundColor: colors.bg.secondary,
              borderRadius: radius.lg,
              padding: spacing[4],
            }}
          >
            <Text
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing[3],
              }}
            >
              {group.name}
            </Text>

            {/* Table Header */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: spacing[2],
                borderBottomWidth: 1,
                borderBottomColor: colors.bg.tertiary,
                paddingBottom: spacing[2],
              }}
            >
              <Text style={{ width: 40, color: colors.text.muted, ...typography.caption }}>
                SET
              </Text>
              <Text style={{ width: 80, color: colors.text.muted, ...typography.caption }}>
                {weightUnit.toUpperCase()}
              </Text>
              <Text style={{ flex: 1, color: colors.text.muted, ...typography.caption }}>
                REPS
              </Text>
            </View>

            {/* Sets */}
            {group.sets.map((set, setIdx) => (
              <View
                key={setIdx}
                style={{
                  flexDirection: 'row',
                  paddingVertical: spacing[2],
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    width: 40, // Fixed width for alignment
                    color: colors.text.muted,
                    ...typography.body,
                    fontSize: 14,
                  }}
                >
                  {setIdx + 1}
                </Text>
                <Text
                  style={{
                    width: 80,
                    color: colors.text.primary,
                    ...typography.body,
                    fontWeight: '600',
                  }}
                >
                  {formatWeight(set.weight || 0, weightUnit)}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    color: colors.text.primary,
                    ...typography.body,
                  }}
                >
                  {set.reps ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {exercises.length === 0 && (
          <Text style={{ color: colors.text.muted, textAlign: 'center', marginTop: spacing[6] }}>
            No exercises logged for this session.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

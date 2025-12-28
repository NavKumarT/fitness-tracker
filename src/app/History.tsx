import { View, Text, Pressable, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Screen from '../components/Screen';
import { getWorkoutHistory } from '../db/history';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { formatWeight } from '../utils/units';

import HistoryCalendar from '../components/HistoryCalendar';

export default function History() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [history, setHistory] = useState<ReturnType<typeof getWorkoutHistory>>([]);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const colors = useThemeStore((s) => s.colors);
  const weightUnit = useUserStore((s) => s.weightUnit);

  const loadHistory = useCallback(() => {
    const data = getWorkoutHistory(sortOrder);
    setHistory(data);
  }, [sortOrder]);

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused, loadHistory]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'));
  };

  const workoutDates = useMemo(() => {
    return history.map(w => {
      const d = new Date(w.started_at);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
  }, [history]);

  return (
    <Screen>
      <View style={{ padding: spacing[5], flex: 1 }}>
        <Text style={[typography.h1, { color: colors.text.primary, marginBottom: spacing[5] }]}>
          History
        </Text>

        <FlatList
          data={history}
          extraData={weightUnit}
          keyExtractor={(w) => w.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing[8] }}
          ListHeaderComponent={
            <View>
              <HistoryCalendar workoutDates={workoutDates} />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: spacing[3] }}>
                <Pressable onPress={toggleSort} style={{ padding: spacing[2] }}>
                  <Text style={{ ...typography.bodySm, color: colors.accent.primary }}>
                    Sort: {sortOrder === 'DESC' ? 'Latest' : 'Earliest'}
                  </Text>
                </Pressable>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text style={{ ...typography.body, color: colors.text.muted, marginTop: spacing[5] }}>
              No workouts yet. Start training!
            </Text>
          }
          renderItem={({ item: w, index }) => {
            const duration =
              w.ended_at && w.started_at
                ? Math.round(
                  (w.ended_at - w.started_at) / 60000
                )
                : 0;

            const dateLabel = new Date(w.started_at).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <Pressable
                  onPress={() =>
                    (navigation as any).navigate(
                      'WorkoutHistoryDetail',
                      { workoutId: w.id }
                    )
                  }
                  style={{
                    padding: spacing[4],
                    marginBottom: spacing[4],
                    backgroundColor: colors.bg.secondary,
                    borderRadius: radius.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={[
                        typography.h2,
                        { color: colors.text.primary },
                      ]}
                    >
                      Workout
                    </Text>

                    <Text style={{ ...typography.caption, color: colors.text.muted }}>
                      {dateLabel}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: spacing[1],
                      ...typography.caption,
                      color: colors.text.muted,
                    }}
                  >
                    {duration} min • {formatWeight(w.total_volume || 0, weightUnit, true)} • {w.exercise_count} exercises
                  </Text>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      </View>
    </Screen>
  );
}

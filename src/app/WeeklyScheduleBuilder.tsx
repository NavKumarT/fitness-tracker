import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { Edit2 } from 'lucide-react-native';
import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';


import Screen from "../components/Screen";
import ExerciseSelection from "../app/ExerciseSelection";

import { typography, spacing, radius } from "../theme/tokens";
import { useThemeStore } from "../stores/themeStore";
import { createWeeklySchedule } from "../db/trainingSchedules";
import {
  addExerciseToTrainingUnit,
  getTrainingUnitByWeekday,
  getScheduleWithExercises,
} from "../db/trainingUnits";

const WEEKDAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

type WeekDayConfig = {
  weekday: number;
  label: string | null;
  is_rest: boolean;
  exercises: { id: string; name: string }[];
};

export default function WeeklyScheduleBuilder() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const colors = useThemeStore((s) => s.colors);

  const [scheduleName, setScheduleName] = useState('My Weekly Plan');

  const [week, setWeek] = useState<WeekDayConfig[]>(
    WEEKDAYS.map((d) => ({
      weekday: d.value,
      label: null,
      is_rest: true,
      exercises: [],
    }))
  );

  // Load existing data if editing
  useEffect(() => {
    if (route.params?.scheduleId) {
      const existing = getScheduleWithExercises(route.params.scheduleId);
      // existing is Array of unit with exercises.

      setWeek((prev) =>
        prev.map((day) => {
          // Find matching unit for this weekday
          // DB weekday: 0-6. WEEKDAYS values: 0-6.
          const match = existing.find((u) => u.weekday === day.weekday);
          if (match) {
            return {
              weekday: day.weekday,
              label: match.label,
              is_rest: !!match.is_rest,
              exercises: match.exercises || [],
            };
          }
          return day;
        })
      );
    }
  }, [route.params?.scheduleId]);

  const [activeDay, setActiveDay] = useState<number | null>(null);

  const activeConfig = week.find((d) => d.weekday === activeDay);

  function toggleRest(weekday: number) {
    setWeek((prev) =>
      prev.map((d) =>
        d.weekday === weekday
          ? {
            ...d,
            is_rest: !d.is_rest,
            label: d.is_rest ? (d.label || "Workout (tap to edit)") : (d.label || "Rest"),
            // Keep exercises when toggling back and forth to avoid accidental data loss
            exercises: d.exercises,
          }
          : d
      )
    );
  }

  function updateLabel(weekday: number, newLabel: string) {
    setWeek((prev) =>
      prev.map((d) =>
        d.weekday === weekday ? { ...d, label: newLabel } : d
      )
    );
  }

  function handleCreate() {
    const hasWorkout = week.some((d) => !d.is_rest && d.exercises.length > 0);
    if (!hasWorkout) return;

    const scheduleId = createWeeklySchedule(
      scheduleName,
      week.map((d) => ({
        weekday: d.weekday,
        label: d.label,
        is_rest: d.is_rest,
      }))
    );

    week.forEach((day) => {
      if (day.is_rest) return;

      const unit = getTrainingUnitByWeekday(scheduleId, day.weekday);
      if (!unit) return;

      day.exercises.forEach((ex, index) => {
        addExerciseToTrainingUnit(unit.id, ex.id, index);
      });
    });

    (navigation as any).popToTop();
    navigation.navigate("HomeTab" as never);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[10] }}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          Build your training week
        </Text>

        {/* Schedule Name Input */}
        <View style={{ marginTop: spacing[6], padding: spacing[5], paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.bg.tertiary }}>
          <Text style={[typography.caption, { color: colors.text.muted, marginBottom: spacing[1] }]}>
            SCHEDULE NAME
          </Text>
          <TextInput
            value={scheduleName}
            onChangeText={setScheduleName}
            placeholder="My Weekly Plan"
            placeholderTextColor={colors.text.muted}
            style={{
              ...typography.h3,
              color: colors.text.primary,
              padding: 0,
            }}
          />
        </View>

        <View style={{ marginTop: spacing[6] }}>
          {WEEKDAYS.map((day) => {
            const config = week.find((d) => d.weekday === day.value)!;

            return (
              <View
                key={day.value}
                style={{
                  marginBottom: spacing[6],
                  padding: spacing[4],
                  backgroundColor: colors.bg.secondary,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: config.is_rest ? colors.border.subtle : 'transparent',
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[4],
                  }}
                >
                  <Text style={{ ...typography.caption, color: colors.text.muted, fontWeight: '700', letterSpacing: 1 }}>
                    {day.label.toUpperCase()}
                  </Text>
                </View>

                {/* REST TOGGLE & LABEL INPUT CONTAINER */}
                <View style={{ gap: spacing[4] }}>

                  {/* LABEL INPUT */}
                  <View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.bg.primary,
                      borderRadius: radius.md,
                      paddingHorizontal: spacing[3],
                      borderWidth: 1,
                      borderColor: colors.border.subtle,
                    }}>
                      <TextInput
                        selectTextOnFocus
                        value={config.label ?? ""}
                        onChangeText={(text) => updateLabel(day.value, text)}
                        placeholder="Workout (tap to edit)"
                        placeholderTextColor={colors.text.muted}
                        style={{
                          flex: 1,
                          paddingVertical: spacing[3],
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      />
                      <Edit2 size={14} color={colors.text.muted} style={{ marginLeft: spacing[2] }} />
                    </View>
                  </View>

                  {/* REST TOGGLE */}
                  <View style={{ flexDirection: 'row', backgroundColor: colors.bg.tertiary, borderRadius: radius.md, padding: 4 }}>
                    <Pressable
                      onPress={() => !config.is_rest || toggleRest(day.value)} // If already active, do nothing? No allow toggling.
                      onPressIn={() => config.is_rest && toggleRest(day.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: radius.sm,
                        backgroundColor: !config.is_rest ? colors.bg.secondary : 'transparent',
                        shadowColor: !config.is_rest ? "#000" : "transparent",
                        shadowOpacity: !config.is_rest ? 0.1 : 0,
                        shadowRadius: 2,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: !config.is_rest ? colors.text.primary : colors.text.muted }}>Workout</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => config.is_rest || toggleRest(day.value)}
                      onPressIn={() => !config.is_rest && toggleRest(day.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: radius.sm,
                        backgroundColor: config.is_rest ? colors.bg.secondary : 'transparent',
                        shadowColor: config.is_rest ? "#000" : "transparent",
                        shadowOpacity: config.is_rest ? 0.1 : 0,
                        shadowRadius: 2,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: config.is_rest ? colors.text.primary : colors.text.muted }}>Rest</Text>
                    </Pressable>
                  </View>

                </View>

                {!config.is_rest && (
                  <View style={{ marginTop: spacing[5], paddingTop: spacing[5], borderTopWidth: 1, borderTopColor: colors.border.subtle }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                      <Text style={{ ...typography.h3, color: colors.text.primary }}>Exercises</Text>
                      <View style={{ backgroundColor: colors.bg.tertiary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ ...typography.caption, color: colors.text.muted }}>{config.exercises.length}</Text>
                      </View>
                    </View>

                    {config.exercises.map((ex) => (
                      <Text
                        key={ex.id}
                        style={{
                          marginBottom: spacing[2],
                          ...typography.body,
                          color: colors.text.secondary,
                        }}
                      >
                        • {ex.name}
                      </Text>
                    ))}

                    <Pressable
                      onPress={() => setActiveDay(config.weekday)}
                      style={{
                        marginTop: spacing[2],
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: spacing[3],
                        borderWidth: 1,
                        borderColor: colors.accent.primary,
                        borderStyle: 'dashed',
                        borderRadius: radius.md
                      }}
                    >
                      <Text style={{ color: colors.accent.primary, fontWeight: '600' }}>
                        + Add / Edit Exercises
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={handleCreate}
          style={{
            marginTop: spacing[6],
            padding: spacing[4],
            borderRadius: radius.lg,
            backgroundColor: colors.bg.secondary,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: colors.accent.primary,
              ...typography.body,
            }}
          >
            Create weekly schedule
          </Text>
        </Pressable>
      </ScrollView>

      {/* Exercise picker modal */}
      <Modal
        visible={activeDay !== null}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colors.bg.primary,
          }}
        >
          {activeConfig && (
            <ExerciseSelection
              selectedExerciseIds={activeConfig.exercises.map(
                (e) => e.id
              )}
              onDone={(selected) => {
                setWeek((prev) =>
                  prev.map((d) =>
                    d.weekday === activeDay
                      ? { ...d, exercises: selected }
                      : d
                  )
                );
                setActiveDay(null);
              }}
              onCancel={() => setActiveDay(null)}
            />
          )}
        </SafeAreaView>
      </Modal>

    </Screen>
  );
}

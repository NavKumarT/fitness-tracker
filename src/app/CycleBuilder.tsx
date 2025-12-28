import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';

import { useThemeStore } from '../stores/themeStore';

import Screen from '../components/Screen';
import { typography, spacing, colors, radius } from '../theme/tokens';

import { getAllExercises, Exercise } from '../db/exercises';
import { createTrainingSchedule } from '../db/trainingSchedules';
import { createTrainingUnit, getScheduleWithExercises } from '../db/trainingUnits';
import { saveExercisesForTrainingUnit } from '../db/trainingUnitExercises';

type CycleDay = {
  id: string;          // UI-only
  name: string;
  isRest: boolean;
  exercises: string[]; // exercise_ids
  expanded: boolean;   // UI-only
};

export default function CycleBuilder() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const [cycleName, setCycleName] = useState('My Training Cycle');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [days, setDays] = useState<CycleDay[]>([
    {
      id: Crypto.randomUUID(),
      name: 'Push',
      isRest: false,
      exercises: [],
      expanded: false,
    },
    {
      id: Crypto.randomUUID(),
      name: 'Pull',
      isRest: false,
      exercises: [],
      expanded: false,
    },
    {
      id: Crypto.randomUUID(),
      name: 'Legs',
      isRest: false,
      exercises: [],
      expanded: false,
    },
  ]);

  useEffect(() => {
    setAllExercises(getAllExercises());

    // PRE-FILL if editing
    if (route.params?.scheduleId) {
      const existing = getScheduleWithExercises(route.params.scheduleId);
      // existing is ordered by order_index.

      if (existing.length > 0) {
        const mapped: CycleDay[] = existing.map(u => ({
          id: u.id, // Reuse ID is fine for UI key
          name: u.label || (u.is_rest ? "Rest" : "Workout"),
          isRest: !!u.is_rest,
          exercises: u.exercises ? u.exercises.map(e => e.id) : [],
          expanded: false
        }));
        setDays(mapped);
      }
    }
  }, [route.params?.scheduleId]);

  /* ---------- Day helpers ---------- */

  function addDay() {
    setDays((prev) => [
      ...prev,
      {
        id: Crypto.randomUUID(),
        name: '',
        isRest: false,
        exercises: [],
        expanded: true,
      },
    ]);
  }

  function updateDay(
    id: string,
    updates: Partial<Omit<CycleDay, 'id'>>
  ) {
    setDays((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }

  function removeDay(id: string) {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((d) => d.id !== id));
  }

  function toggleExercise(dayId: string, exerciseId: string) {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
            ...d,
            exercises: d.exercises.includes(exerciseId)
              ? d.exercises.filter((x) => x !== exerciseId)
              : [...d.exercises, exerciseId],
          }
          : d
      )
    );
  }

  function canCreateCycle() {
    return days.some((d) => !d.isRest);
  }

  /* ---------- Persist everything (atomic) ---------- */

  function handleCreateCycle() {
    // 1️⃣ Create cycle schedule (single source of truth)
    const scheduleId = createTrainingSchedule('cycle');

    if (!scheduleId) {
      console.error('Failed to create cycle schedule');
      return;
    }

    // 2️⃣ Create training units
    days.forEach((day, index) => {
      const trainingUnitId = createTrainingUnit(
        scheduleId,
        index,
        day.name || `Day ${index + 1}`,
        day.isRest
      );

      if (!day.isRest && day.exercises.length > 0) {
        saveExercisesForTrainingUnit(
          trainingUnitId,
          day.exercises
        );
      }
    });

    // 3️⃣ Navigate home
    (navigation as any).popToTop();
    navigation.navigate('HomeTab' as never);
  }

  /* ---------- Render ---------- */

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        {/* Fixed Header: Cycle Name */}
        <View style={{ padding: spacing[5], paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.bg.tertiary }}>
          <Text style={[typography.caption, { color: colors.text.muted, marginBottom: spacing[1] }]}>
            CYCLE NAME
          </Text>
          <TextInput
            value={cycleName}
            onChangeText={setCycleName}
            placeholder="My Training Cycle"
            placeholderTextColor={colors.text.muted}
            style={{
              ...typography.h3,
              color: colors.text.primary,
              padding: 0,
            }}
          />

          {/* Quick Preview of the Cycle */}
          <View style={{ flexDirection: 'row', marginTop: spacing[4], flexWrap: 'wrap', gap: 6 }}>
            {days.map((d, i) => (
              <View
                key={d.id}
                style={{
                  backgroundColor: d.isRest ? colors.bg.tertiary : colors.accent.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: d.isRest ? colors.text.muted : colors.bg.primary }}>
                  {d.name || `Day ${i + 1}`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: 100 }}>
          <Text style={[typography.h1, { color: colors.text.primary, marginBottom: spacing[6] }]}>
            Build Schedule
          </Text>

          {/* Days List */}
          <View>
            {days.map((day, index) => (
              <View
                key={day.id}
                style={{
                  marginBottom: spacing[6],
                  padding: spacing[4],
                  backgroundColor: colors.bg.secondary,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: day.isRest ? colors.border.subtle : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[4] }}>
                  <Text
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      fontWeight: '700',
                      letterSpacing: 1,
                    }}
                  >
                    DAY {index + 1}
                  </Text>

                  {days.length > 1 && (
                    <Pressable onPress={() => removeDay(day.id)}>
                      <Text style={{ ...typography.caption, color: colors.semantic.error }}>
                        Remove
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Day Input & Type Toggle */}
                <View style={{ gap: spacing[4] }}>
                  {/* Name Input */}
                  <View>
                    <Text style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing[2] }}>
                      LABEL
                    </Text>
                    <TextInput
                      value={day.name}
                      onChangeText={(text) => updateDay(day.id, { name: text })}
                      placeholder={day.isRest ? "Rest Day" : "e.g. Push, Pull, Legs"}
                      placeholderTextColor={colors.text.muted}
                      style={{
                        backgroundColor: colors.bg.tertiary,
                        borderRadius: radius.md,
                        padding: spacing[3],
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    />
                  </View>

                  {/* REST TOGGLE - Segmented Style */}
                  <View style={{ flexDirection: 'row', backgroundColor: colors.bg.tertiary, borderRadius: radius.md, padding: 4 }}>
                    <Pressable
                      onPress={() => updateDay(day.id, { isRest: false })}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: radius.sm,
                        backgroundColor: !day.isRest ? colors.bg.secondary : 'transparent',
                        shadowColor: !day.isRest ? "#000" : "transparent",
                        shadowOpacity: !day.isRest ? 0.1 : 0,
                        shadowRadius: 2,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: !day.isRest ? colors.text.primary : colors.text.muted }}>Workout</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => updateDay(day.id, { isRest: true })}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: radius.sm,
                        backgroundColor: day.isRest ? colors.bg.secondary : 'transparent',
                        shadowColor: day.isRest ? "#000" : "transparent",
                        shadowOpacity: day.isRest ? 0.1 : 0,
                        shadowRadius: 2,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: day.isRest ? colors.text.primary : colors.text.muted }}>Rest</Text>
                    </Pressable>
                  </View>

                </View>

                {/* Inline exercise picker (Only if Workout) */}
                {!day.isRest && (
                  <View style={{ marginTop: spacing[5], paddingTop: spacing[5], borderTopWidth: 1, borderTopColor: colors.border.subtle }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                      <Text style={{ ...typography.h3, color: colors.text.primary }}>Exercises</Text>
                      <View style={{ backgroundColor: colors.bg.tertiary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ ...typography.caption, color: colors.text.muted }}>{day.exercises.length}</Text>
                      </View>
                    </View>

                    {day.expanded ? (
                      <DayExercisePicker
                        allExercises={allExercises}
                        selectedIds={day.exercises}
                        onToggle={(id) => toggleExercise(day.id, id)}
                        onDone={() => updateDay(day.id, { expanded: false })}
                      />
                    ) : (
                      <View>
                        {/* Show selected exercises summary */}
                        {day.exercises.length > 0 && (
                          <View style={{ marginBottom: spacing[3], gap: 4 }}>
                            {day.exercises.map(exId => {
                              const ex = allExercises.find(e => e.id === exId);
                              return (
                                <View key={exId} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Text style={{ color: colors.accent.primary, fontSize: 10 }}>●</Text>
                                  <Text style={{ ...typography.body, color: colors.text.primary }}>
                                    {ex?.name || 'Unknown Exercise'}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                        <Pressable
                          onPress={() => updateDay(day.id, { expanded: true })}
                          style={{
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
                            {day.exercises.length > 0 ? 'Edit Exercises' : '+ Add Exercises'}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Add day */}
          <Pressable
            onPress={addDay}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing[4],
              backgroundColor: colors.bg.secondary,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border.subtle,
              borderStyle: 'dashed'
            }}
          >
            <Text style={{ ...typography.h3, color: colors.text.muted }}>+ Add Another Day</Text>
          </Pressable>

          {/* Create cycle */}
          <Pressable
            disabled={!canCreateCycle()}
            onPress={handleCreateCycle}
            style={{
              marginTop: spacing[8],
              padding: spacing[4],
              backgroundColor: canCreateCycle()
                ? colors.accent.primary
                : colors.bg.tertiary,
              borderRadius: radius.md,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...typography.body,
                fontWeight: '600',
                color: canCreateCycle()
                  ? colors.bg.primary
                  : colors.text.muted,
              }}
            >
              Finish & Create Cycle
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Screen>
  );
}

// Sub-component to handle local search state
function DayExercisePicker({
  allExercises,
  selectedIds,
  onToggle,
  onDone,
}: {
  allExercises: Exercise[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onDone: () => void;
}) {
  const [search, setSearch] = useState('');
  const colors = useThemeStore((s) => s.colors);

  const filtered = allExercises.filter((e) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(lower) ||
      (e.aliases && e.aliases.toLowerCase().includes(lower))
    );
  });

  return (
    <View
      style={{
        marginTop: spacing[3],
        padding: spacing[3],
        backgroundColor: colors.bg.tertiary,
        borderRadius: radius.md,
        height: 400, // Fixed height to allow nested ScrollView to function correctly
      }}
    >
      {/* Search Bar */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises..."
        placeholderTextColor={colors.text.muted}
        style={{
          backgroundColor: colors.bg.secondary,
          padding: spacing[3],
          borderRadius: radius.sm,
          color: colors.text.primary,
          ...typography.body,
          marginBottom: spacing[3],
        }}
      />

      <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
        {filtered.slice(0, 50).map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => onToggle(item.id)}
              style={{
                paddingVertical: spacing[3],
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: colors.border.subtle,
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: selected ? colors.accent.primary : colors.text.primary,
                  flex: 1,
                }}
              >
                {item.name}
              </Text>
              {selected && (
                <Text style={{ color: colors.accent.primary }}>✓</Text>
              )}
            </Pressable>
          );
        })}
        {filtered.length > 50 && (
          <Text style={{ padding: spacing[4], textAlign: 'center', color: colors.text.muted }}>
            ...and {filtered.length - 50} more
          </Text>
        )}
      </ScrollView>

      <Pressable
        onPress={onDone}
        style={{
          marginTop: spacing[3],
          padding: spacing[3],
          backgroundColor: colors.accent.primary,
          borderRadius: radius.sm,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            ...typography.body,
            color: colors.bg.primary,
            fontWeight: '600',
          }}
        >
          Done
        </Text>
      </Pressable>
    </View>
  );
}

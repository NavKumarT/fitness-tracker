import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useThemeStore } from '../stores/themeStore'; // Assuming this exists
import { typography, spacing, radius } from '../theme/tokens'; // Assuming these exist
import Screen from '../components/Screen'; // Assuming this exists
import { Calendar, ChevronRight, Dumbbell, Repeat } from 'lucide-react-native';
import { getScheduleWithExercises } from '../db/trainingUnits';

// We need a way to get the *active* schedule ID. 
// `useHomeState` uses `getActiveSchedule()`. Let's check `src/db/workouts.ts` or similar for that function.
// Actually `useHomeState` in `src/hooks/useHomeState.ts` does `const schedule = db.getFirstSync(...)`.
// We should probably export `getActiveSchedule` from somewhere or duplicate the query.
// I'll duplicate the query right inside the component or abstract it if I can find it.
// Checking `src/db/workouts.ts`: It doesn't seem to have `getActiveSchedule` exported based on previous views.
// `src/hooks/useHomeState.ts` has the query.
// I'll create a local helper or simple query inside the component.

import { db } from '../db/index';

function getActiveScheduleId() {
    const s = db.getFirstSync(`SELECT id, name, type FROM training_schedules WHERE is_active = 1 LIMIT 1`) as any;
    return s;
}

export default function ScheduleViewer() {
    const navigation = useNavigation();
    const colors = useThemeStore((s) => s.colors);

    const [schedule, setSchedule] = useState<{ id: string; name: string; type: 'weekly' | 'cycle' } | null>(null);
    const [units, setUnits] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            const active = getActiveScheduleId();
            if (active) {
                setSchedule(active);
                setUnits(getScheduleWithExercises(active.id));
            }
        }, [])
    );

    const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
        <Screen showBackButton={true}>
            <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[10] }}>

                {/* HEADER INFO */}
                {schedule && (
                    <View style={{ marginBottom: spacing[6] }}>
                        <Text style={{ ...typography.caption, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Current Schedule
                        </Text>
                        <Text style={{ ...typography.h1, color: colors.text.primary, marginTop: spacing[1] }}>
                            {schedule.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[2] }}>
                            <Repeat size={14} color={colors.accent.primary} style={{ marginRight: 6 }} />
                            <Text style={{ ...typography.bodySm, color: colors.accent.primary }}>
                                {schedule.type === 'weekly' ? 'Weekly Schedule' : 'Repeating Cycle'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* UNITS LIST */}
                <View style={{ gap: spacing[4] }}>
                    {units.map((unit, index) => {
                        const label = schedule?.type === 'weekly'
                            ? WEEKDAYS[unit.weekday]
                            : `Day ${unit.order_index + 1}`;

                        const title = unit.label || (unit.is_rest ? "Rest Day" : "Workout");

                        return (
                            <View key={index} style={{
                                backgroundColor: colors.bg.secondary,
                                borderRadius: radius.md,
                                padding: spacing[4],
                                borderWidth: 1,
                                borderColor: colors.border.subtle
                            }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: unit.is_rest ? 0 : spacing[3] }}>
                                    <View>
                                        <Text style={{ ...typography.caption, color: colors.text.muted }}>
                                            {label}
                                        </Text>
                                        <Text style={{ ...typography.h3, color: unit.is_rest ? colors.text.muted : colors.text.primary }}>
                                            {title}
                                        </Text>
                                    </View>
                                    {unit.is_rest === 1 && (
                                        <View style={{ backgroundColor: colors.bg.tertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                            <Text style={{ ...typography.caption, color: colors.text.muted }}>REST</Text>
                                        </View>
                                    )}
                                </View>

                                {/* EXERCISES LIST */}
                                {unit.exercises && unit.exercises.length > 0 && (
                                    <View style={{ marginTop: spacing[2], gap: spacing[2] }}>
                                        {unit.exercises.map((ex: any, i: number) => (
                                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent.primary, marginRight: spacing[2] }} />
                                                <Text style={{ ...typography.bodySm, color: colors.text.secondary }}>
                                                    {ex.name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {!unit.is_rest && (!unit.exercises || unit.exercises.length === 0) && (
                                    <Text style={{ ...typography.caption, color: colors.semantic.warning, marginTop: spacing[2] }}>
                                        No exercises added
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* BOTTOM CTA */}
                <View style={{ marginTop: spacing[8], marginBottom: spacing[8] }}>
                    <Pressable
                        onPress={() => {
                            // Navigate to Onboarding stack root to start fresh
                            // We need to make sure we reset properly?
                            // User said: "redirects them to the same flow we have from the profile page"
                            // In Profile.tsx: navigation.navigate('OnboardingTrainingStyle' as never)
                            navigation.navigate('OnboardingTrainingStyle' as never);
                        }}
                        style={({ pressed }) => ({
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: colors.semantic.error,
                            padding: spacing[4],
                            borderRadius: radius.full,
                            alignItems: 'center',
                            opacity: pressed ? 0.7 : 1
                        })}
                    >
                        <Text style={{ ...typography.body, fontWeight: '600', color: colors.semantic.error }}>
                            Change Training Schedule
                        </Text>
                    </Pressable>
                    <Text style={{ textAlign: 'center', color: colors.text.muted, marginTop: spacing[3], ...typography.caption }}>
                        This will archive your current plan and start a new one.
                    </Text>
                </View>

            </ScrollView>
        </Screen>
    );
}

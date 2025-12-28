import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Play } from 'lucide-react-native';
import { useState, useCallback, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '../components/Screen';
import TodayCard from '../components/TodayCard';
import WorkoutPreviewCard from '../components/WorkoutPreviewCard';
import BodyHeatmap from '../components/BodyHeatmap';
import WeeklyConsistency from '../components/WeeklyConsistency';
import QuickStats from '../components/QuickStats';
import { BreathingGradientButton } from '../components/BreathingGradientButton';

import { typography, spacing, radius } from '../theme/tokens';
import { useHomeState } from '../hooks/useHomeState';
import { FEATURES } from '../config/featureFlags';

import { startWorkoutFromTemplate, startWorkout } from '../db/workouts';
import {
  getMuscleVolumeHeatmap,
  type MuscleVolume,
  getWeeklyConsistency,
  getWorkoutStreak
} from '../db/stats';

import { useWorkoutStore } from '../stores/workoutStores';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useTipsStore } from '../stores/tipsStore';
import TipCard from '../components/TipCard';

function getNextUpSubtitle(date?: Date) {
  if (!date) return "Scheduled for your next session";

  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear()) {
    return "Up next: Tomorrow";
  }

  return `Up next: ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
}

export default function Home() {
  const navigation = useNavigation();
  const colors = useThemeStore((s) => s.colors);
  const isMinimalist = useUIStore((s) => s.isMinimalistMode);
  const { hasDismissedRenameTip, dismissRenameTip } = useTipsStore();

  const [muscleData, setMuscleData] = useState<MuscleVolume[]>([]);
  const [consistency, setConsistency] = useState<{ date: Date; hasWorkout: boolean }[]>([]);
  const [streak, setStreak] = useState(0);

  const totalVolume = useMemo(() => muscleData.reduce((acc, c) => acc + c.volume, 0), [muscleData]);

  useFocusEffect(
    useCallback(() => {
      setMuscleData(getMuscleVolumeHeatmap(7));
      if (FEATURES.HOME_V2_ENABLED) {
        setConsistency(getWeeklyConsistency());
        setStreak(getWorkoutStreak());
      }
    }, [])
  );

  const { state, todayUnit, todaySummary, nextUnit } = useHomeState();
  const setActiveWorkout = useWorkoutStore((s) => s.setActiveWorkout);

  function handleStartWorkout(isAdHoc = false) {
    let workoutId;

    if (isAdHoc) {
      workoutId = startWorkout();
    } else {
      workoutId = startWorkoutFromTemplate();
    }

    if (!workoutId) return;
    setActiveWorkout(workoutId);
    navigation.navigate('Workout' as never);
  }

  function handleResumeWorkout() {
    navigation.navigate('Workout' as never);
  }

  // --- PREMIUM COMPONENT WRAPPERS ---
  const Container = isMinimalist ? View : Animated.View;
  const animProps = isMinimalist ? {} : { entering: FadeInDown.delay(100).springify() };

  return (
    <Screen showBackButton={false}>

      {/* PREMIUM BACKGROUND GRADIENT - Handled by Screen.tsx now */}

      <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[10] }}>

        {/* BRANDING */}
        <View style={{ marginBottom: spacing[6], marginTop: spacing[2] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 32, height: 32, resizeMode: 'contain', marginRight: spacing[2] }}
            />
            <Text style={{
              fontSize: 24,
              fontWeight: '900',
              fontStyle: 'italic',
              color: colors.accent.primary,
              letterSpacing: -1
            }}>
              RepRecord
            </Text>
          </View>

          {/* Personalized Greeting */}
          <Text style={{
            marginTop: spacing[4],
            ...typography.h1,
            color: colors.text.primary,
            textAlign: 'center'
          }}>
            Welcome back, {useAuthStore.getState().user?.name?.split(' ')[0] || 'Athlete'}
          </Text>
        </View>

        {/* HOME V2: CONSISTENCY RINGS */}
        {FEATURES.HOME_V2_ENABLED && FEATURES.SHOW_CONSISTENCY_RINGS && (
          <Container {...(isMinimalist ? {} : { entering: FadeInDown.delay(50).springify() })}>
            <WeeklyConsistency data={consistency} />
          </Container>
        )}

        {/* SMART ACTIONS */}
        {state !== 'ACTIVE_WORKOUT' && (
          <Container {...(isMinimalist ? {} : { entering: FadeInDown.duration(600).springify() })}>
            <View style={{ marginTop: spacing[1], marginBottom: spacing[4], alignItems: 'center' }}>

              {/* TIP: Renaming */}
              {!hasDismissedRenameTip && state === 'TODAY_WORKOUT' && (
                <TipCard
                  message="Tip: You can rename workouts or change training days by tapping on the headers in your schedule."
                  onDismiss={dismissRenameTip}
                  delay={2000} // Show after 2 seconds to not disturb initial focus
                />
              )}

              {/* SCENARIO: Scheduled & Pending */}
              {state === 'TODAY_WORKOUT' ? (
                <>
                  {/* Primary: Start Scheduled */}
                  <BreathingGradientButton
                    label="Start Scheduled Workout"
                    icon={<Play size={16} color={colors.bg.primary} fill={colors.bg.primary} />}
                    onPress={() => handleStartWorkout(false)}
                  />

                  {/* Secondary: Ad-hoc */}
                  <Pressable
                    onPress={() => handleStartWorkout(true)}
                    hitSlop={8}
                    style={{ marginTop: spacing[3] }}
                  >
                    <Text style={{ ...typography.caption, color: colors.text.muted }}>
                      or <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Start Ad-hoc Workout</Text>
                    </Text>
                  </Pressable>
                </>
              ) : (
                /* SCENARIO: Rest, Complete, or New User */
                <BreathingGradientButton
                  label="Start Ad-hoc Workout"
                  icon={<Play size={16} color={colors.bg.primary} fill={colors.bg.primary} />}
                  onPress={() => handleStartWorkout(true)}
                  colors={[colors.accent.secondary, colors.accent.primary]} // Alternate gradient
                />
              )}
            </View>
          </Container>
        )}

        {/* HOME V2: QUICK STATS */}
        {FEATURES.HOME_V2_ENABLED && FEATURES.SHOW_QUICK_STATS && (
          <Container {...(isMinimalist ? {} : { entering: FadeInDown.delay(150).springify() })}>
            <QuickStats streak={streak} workoutsLast7Days={consistency.filter(d => d.hasWorkout).length} />
          </Container>
        )}

        <Container {...(isMinimalist ? {} : { entering: FadeInDown.duration(600).springify() })}>
          {/* NEW USER */}
          {state === 'NEW_USER' && (
            <TodayCard
              style={{ marginTop: spacing[4] }}
              title="Start Your Journey"
              subtitle="Create your first training plan to get started"
            >
              <Text
                onPress={() => navigation.navigate('OnboardingTrainingStyle' as never)}
                style={{
                  marginTop: spacing[5],
                  ...typography.body,
                  color: colors.accent.primary,
                }}
              >
                Create Training Plan
              </Text>
            </TodayCard>
          )}

          {/* ACTIVE WORKOUT */}
          {state === 'ACTIVE_WORKOUT' && (
            <TodayCard
              title="Workout in progress"
              subtitle="Pick up where you left off"
            >
              <Text
                onPress={handleResumeWorkout}
                style={{
                  marginTop: spacing[5],
                  ...typography.body,
                  color: colors.accent.primary,
                }}
              >
                Resume Workout
              </Text>
            </TodayCard>
          )}

          {/* TODAY – WORKOUT DAY */}
          {state === 'TODAY_WORKOUT' && todayUnit && (
            <WorkoutPreviewCard
              title={todayUnit.label}
              subtitle="You’re scheduled to train today"
              exercises={todayUnit.exercises}
              actionLabel="Start Workout"
              onAction={() => handleStartWorkout()}
            />
          )}

          {/* TODAY – REST DAY */}
          {state === 'TODAY_REST' && (
            <View>
              <TodayCard
                title="Rest & Recovery"
                subtitle="Your body grows when you rest, not when you train."
              >
                <Text style={{ marginTop: spacing[4], ...typography.body, color: colors.text.muted }}>
                  Take a break. You've earned it.
                </Text>
              </TodayCard>

              {nextUnit && (
                <View style={{ marginTop: spacing[6] }}>
                  <WorkoutPreviewCard
                    isNextUp
                    title={nextUnit.label}
                    subtitle={getNextUpSubtitle(nextUnit.date)}
                    exercises={nextUnit.exercises}
                    actionLabel="View Schedule"
                    onAction={() => navigation.navigate('ScheduleViewer' as never)}
                  />
                </View>
              )}
            </View>
          )}

          {/* TODAY COMPLETE */}
          {state === 'TODAY_COMPLETE' && (
            <View>
              <TodayCard
                title="Workout complete"
                subtitle={
                  todaySummary
                    ? `${todaySummary.durationMinutes} min • ${todaySummary.setCount} sets`
                    : 'You’ve finished today’s session'
                }
              >
                <Text style={{ marginTop: spacing[4], ...typography.body, color: colors.text.muted }}>
                  Good work. See you tomorrow.
                </Text>
              </TodayCard>

              {nextUnit && (
                <View style={{ marginTop: spacing[6] }}>
                  <WorkoutPreviewCard
                    isNextUp
                    title={nextUnit.label}
                    subtitle={getNextUpSubtitle(nextUnit.date)}
                    exercises={nextUnit.exercises}
                    actionLabel="View Schedule"
                    onAction={() => navigation.navigate('ScheduleViewer' as never)}
                  />
                </View>
              )}
            </View>
          )}
        </Container>

        {/* RECOVERY STATUS (HEATMAP) */}
        {/* Only animate separately if not minimalist */}
        {/* RECOVERY STATUS (HEATMAP) */}
        {/* Only animate separately if not minimalist */}
        {/* RECOVERY STATUS (HEATMAP) */}
        {/* Only animate separately if not minimalist */}
        {totalVolume > 0 && (
          <>
            <View style={{ height: spacing[8] }} />
            <Container {...(isMinimalist ? {} : { entering: FadeInDown.delay(200).duration(600).springify() })}>

              <View style={{
                backgroundColor: colors.bg.secondary,
                padding: spacing[4],
                borderRadius: radius.lg,
                // Add shadow/border for premium feel
                borderWidth: isMinimalist ? 0 : 1,
                borderColor: colors.accent.primary + '20',
                shadowColor: isMinimalist ? 'transparent' : colors.accent.primary,
                shadowOpacity: isMinimalist ? 0 : 0.1,
                shadowRadius: 10
              }}>
                <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[4] }}>
                  Recovery Status (Last 7 Days)
                </Text>
                <BodyHeatmap data={muscleData} />
              </View>
            </Container>
          </>
        )}



      </ScrollView>
    </Screen>
  );
}

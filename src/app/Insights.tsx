import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Svg, Text as SvgText, G, Circle } from 'react-native-svg';

import Screen from '../components/Screen';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { getConsistencyHeatmap, getWeeklyStats, getMuscleUsage, type MuscleUsage } from '../db/insights';
import { getRecentPRs, type PRRecord, getLifetimeStats, type LifetimeStats } from '../db/stats';
import { useUserStore } from '../stores/userStore';
import { formatWeight } from '../utils/units';

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- TIME RANGE COMPONENT ---
type TimeRange = '1M' | '3M' | '6M' | '1Y';
const TIME_RANGES: { label: string; value: TimeRange; days: number }[] = [
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
];

function TimeRangeSelector({ selected, onSelect, colors }: { selected: TimeRange, onSelect: (t: TimeRange) => void, colors: any }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.bg.secondary, borderRadius: radius.lg, padding: 4, marginBottom: spacing[6] }}>
      {TIME_RANGES.map((range) => {
        const isActive = range.value === selected;
        return (
          <Pressable
            key={range.value}
            onPress={() => onSelect(range.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: 'center',
              backgroundColor: isActive ? colors.bg.primary : 'transparent',
              borderRadius: radius.md,
              shadowColor: isActive ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isActive ? 0.1 : 0,
              shadowRadius: 4,
            }}
          >
            <Text style={{ ...typography.bodySm, fontWeight: isActive ? '700' : '400', color: isActive ? colors.text.primary : colors.text.muted }}>
              {range.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// --- DONUT CHART FOR MUSCLE SPLIT ---
function MuscleSplitChart({ data, colors }: { data: MuscleUsage[], colors: any }) {
  const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0);
  if (totalVolume === 0) return (
    <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ ...typography.body, color: colors.text.muted }}>No data for selected period.</Text>
    </View>
  );

  const radius = 60;
  const strokeWidth = 20;
  let startAngle = 0;

  // Top 5 muscles only + "Other"
  const sorted = [...data].sort((a, b) => b.volume - a.volume);
  const topSegments = sorted.slice(0, 5);
  const otherVolume = sorted.slice(5).reduce((acc, curr) => acc + curr.volume, 0);

  if (otherVolume > 0) {
    topSegments.push({ muscle: 'Other', volume: otherVolume, setCount: 0 });
  }

  // Color palette for chart
  const CHART_COLORS = [
    colors.accent.primary,
    colors.accent.secondary,
    '#60A5FA', // Blue
    '#A78BFA', // Purple
    '#F472B6', // Pink
    colors.bg.tertiary // Other
  ];

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', width: 200, height: 200 }}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <G rotation={-90} origin="100, 100">
            {topSegments.map((segment, index) => {
              const percentage = segment.volume / totalVolume;
              const angle = percentage * 360;

              const circumference = 2 * Math.PI * radius;
              const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
              const rotation = startAngle;

              startAngle += angle;

              return (
                <Circle
                  key={index}
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  rotation={rotation}
                  origin="100, 100"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
          <SvgText
            x="100"
            y="95"
            fill={colors.text.primary}
            fontSize="24"
            fontWeight="bold"
            textAnchor="middle"
          >
            {topSegments.length}
          </SvgText>
          <SvgText
            x="100"
            y="115"
            fill={colors.text.muted}
            fontSize="12"
            textAnchor="middle"
          >
            Muscles
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={{ flex: 1, gap: 8 }}>
        {topSegments.map((segment, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
            <View>
              <Text style={{ ...typography.caption, color: colors.text.primary, fontWeight: '600', textTransform: 'capitalize' }}>
                {segment.muscle}
              </Text>
              <Text style={{ ...typography.caption, fontSize: 10, color: colors.text.muted }}>
                {Math.round((segment.volume / totalVolume) * 100)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- LIFETIME STATS CARD ---
function LifetimeStatsCard({ label, value, subLabel, colors }: { label: string, value: string, subLabel: string, colors: any }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.secondary, padding: spacing[4], borderRadius: radius.md, alignItems: 'center' }}>
      <Text style={{ ...typography.h2, color: colors.accent.primary }}>{value}</Text>
      <Text style={{ ...typography.bodySm, fontWeight: '600', color: colors.text.primary, marginTop: 4 }}>{label}</Text>
      <Text style={{ ...typography.caption, color: colors.text.muted }}>{subLabel}</Text>
    </View>
  );
}


export default function Insights() {
  const colors = useThemeStore((s) => s.colors);
  const weightUnit = useUserStore((s) => s.weightUnit);

  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([]);
  const [muscleUsage, setMuscleUsage] = useState<MuscleUsage[]>([]);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>({ totalWorkouts: 0, totalVolume: 0, totalDurationMs: 0, currentStreak: 0 });
  const [recentPRs, setRecentPRs] = useState<PRRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData(timeRange);
    }, [timeRange])
  );

  const loadData = (range: TimeRange) => {
    const days = TIME_RANGES.find(r => r.value === range)?.days || 90;

    setHeatmap(getConsistencyHeatmap(days));
    setMuscleUsage(getMuscleUsage(days));
    setLifetimeStats(getLifetimeStats()); // This effectively ignores time range for "Lifetime", which is correct
    setRecentPRs(getRecentPRs(days));
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'k';
    return vol.toString();
  };

  // --- HEATMAP RENDER ---
  const renderConsistencyHeatmap = () => {
    const daysToShow = 84; // Keep consistency view fixed or dynamic? Fixed looks better for grid.
    const today = new Date();
    const days = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const match = heatmap.find(h => h.date === iso);
      days.push({ count: match ? match.count : 0 });
    }

    // Grid layout: 7 rows (days), X columns (weeks)
    // We actually render columns of 7 days
    const columns = [];
    let currentColumn = [];
    for (let i = 0; i < days.length; i++) {
      currentColumn.push(days[i]);
      if (currentColumn.length === 7) {
        columns.push(currentColumn);
        currentColumn = [];
      }
    }

    return (
      <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
        {columns.map((col, cIdx) => (
          <View key={cIdx} style={{ gap: 4 }}>
            {col.map((day, dIdx) => (
              <View
                key={`${cIdx}-${dIdx}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: day.count > 0
                    ? (day.count > 1 ? colors.accent.primary : colors.accent.secondary)
                    : colors.bg.tertiary,
                  opacity: day.count > 0 ? 1 : 0.3
                }}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[10] }}>
        <Text style={[typography.h1, { color: colors.text.primary, marginBottom: spacing[2] }]}>
          Insights
        </Text>
        <Text style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing[6] }}>
          Overview of your training journey.
        </Text>

        {/* --- LIFETIME STATS ROW --- */}
        <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[6] }}>
          <LifetimeStatsCard
            label="Workouts"
            value={lifetimeStats.totalWorkouts.toString()}
            subLabel="Completed"
            colors={colors}
          />
          <LifetimeStatsCard
            label="Streak"
            value={lifetimeStats.currentStreak.toString()}
            subLabel="Current Days"
            colors={colors}
          />
          <LifetimeStatsCard
            label="Time"
            value={Math.round(lifetimeStats.totalDurationMs / (1000 * 60 * 60)).toString()}
            subLabel="Hours"
            colors={colors}
          />
        </View>

        <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} colors={colors} />

        {/* --- MUSCLE SPLIT CARD --- */}
        <View style={{ backgroundColor: colors.bg.secondary, padding: spacing[5], borderRadius: radius.lg, marginBottom: spacing[6] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[4] }}>
            <Text style={{ ...typography.h3, color: colors.text.primary }}>Training Split</Text>
            <Text style={{ ...typography.caption, color: colors.text.muted }}>Distribution by Volume</Text>
          </View>
          <MuscleSplitChart data={muscleUsage} colors={colors} />
        </View>

        {/* --- CONSISTENCY CARD --- */}
        <View style={{ backgroundColor: colors.bg.secondary, padding: spacing[5], borderRadius: radius.lg, marginBottom: spacing[6] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[4] }}>
            <Text style={{ ...typography.h3, color: colors.text.primary }}>Consistency</Text>
            <Text style={{ ...typography.caption, color: colors.text.muted }}>Last 12 Weeks</Text>
          </View>
          {renderConsistencyHeatmap()}
        </View>

        {/* --- RECENT PRS --- */}
        {recentPRs.length > 0 && (
          <View style={{ marginBottom: spacing[6] }}>
            <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[4] }}>Recent Records</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[4], paddingRight: spacing[5] }}>
              {recentPRs.map((pr, idx) => (
                <View key={idx} style={{
                  width: 160,
                  backgroundColor: colors.bg.secondary,
                  padding: spacing[4],
                  borderRadius: radius.md,
                  borderTopWidth: 4,
                  borderTopColor: idx === 0 ? colors.accent.primary : (idx === 1 ? colors.accent.secondary : colors.border.subtle)
                }}>
                  <Text style={{ ...typography.caption, color: colors.text.muted, marginBottom: 4 }}>
                    {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={{ ...typography.h3, fontSize: 18, color: colors.text.primary }} numberOfLines={1}>
                    {pr.exerciseName}
                  </Text>
                  <Text style={{ ...typography.h1, fontSize: 28, color: colors.accent.primary, marginVertical: spacing[2] }}>
                    {formatWeight(pr.weight, weightUnit)}
                    <Text style={{ fontSize: 14, color: colors.text.muted }}>{weightUnit}</Text>
                  </Text>
                  <Text style={{ ...typography.caption, color: colors.text.muted }}>
                    Personal Best
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </Screen>
  );
}

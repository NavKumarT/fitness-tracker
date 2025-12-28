import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Svg, Rect, Text as SvgText, Line, G } from 'react-native-svg';

import Screen from '../components/Screen';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { getConsistencyHeatmap, getWeeklyStats } from '../db/insights';
import { getRecentPRs, type PRRecord } from '../db/stats';
import { useUserStore } from '../stores/userStore';
import { formatWeight } from '../utils/units';

const CHART_HEIGHT = 180;
const CHART_WIDTH = Dimensions.get('window').width - 80;

function VolumeChart({ data, color, textColor, unit }: { data: any[], color: string, textColor: string, unit: string }) {
  const maxVal = Math.max(...data.map(d => d.volume), 1);
  const barWidth = 20;
  const spacingX = (CHART_WIDTH - (data.length * barWidth)) / (data.length + 1);

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Axis Line */}
      <Line
        x1="0"
        y1={CHART_HEIGHT - 20}
        x2={CHART_WIDTH}
        y2={CHART_HEIGHT - 20}
        stroke={textColor}
        strokeWidth="1"
        opacity={0.2}
      />

      {data.map((item, index) => {
        const x = spacingX + index * (barWidth + spacingX);
        const barHeight = (item.volume / maxVal) * (CHART_HEIGHT - 40);
        const y = CHART_HEIGHT - 20 - barHeight;

        // Convert volume for display label
        const vol = unit === 'kg' ? item.volume : item.volume * 2.20462;
        const displayLabel = vol > 0 ? (vol / 1000).toFixed(1) + 'k' : '';

        return (
          <G key={index}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
            />
            <SvgText
              x={x + barWidth / 2}
              y={CHART_HEIGHT - 5}
              fill={textColor}
              fontSize="10"
              textAnchor="middle"
            >
              {item.weekLabel}
            </SvgText>
            <SvgText
              x={x + barWidth / 2}
              y={y - 5}
              fill={textColor}
              fontSize="8"
              textAnchor="middle"
            >
              {displayLabel}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function Insights() {
  const colors = useThemeStore((s) => s.colors);
  const weightUnit = useUserStore((s) => s.weightUnit);
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<ReturnType<typeof getWeeklyStats>>([]);
  const [recentPRs, setRecentPRs] = useState<PRRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      // Load data on focus
      setHeatmap(getConsistencyHeatmap(84)); // 12 weeks
      setWeeklyStats(getWeeklyStats());
      setRecentPRs(getRecentPRs(90)); // Last 90 days bests
    }, [])
  );

  // --- HEATMAP GENERATION ---
  const renderHeatmap = () => {
    // Generate dates for the last 12 weeks
    const today = new Date();
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const match = heatmap.find(h => h.date === iso);
      days.push({
        date: iso,
        count: match ? match.count : 0,
        dayOfWeek: d.getDay() // 0=Sun, 1=Mon...
      });
    }

    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) weeks.push(currentWeek);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={{ gap: 4 }}>
              {week.map((day, dIdx) => (
                <View
                  key={day.date}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: day.count > 0
                      ? (day.count > 1 ? colors.accent.primary : colors.accent.secondary)
                      : colors.bg.tertiary
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[10] }}>
        {/* Header */}
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          Insights
        </Text>

        {/* Heatmap */}
        <View style={{ marginTop: spacing[6], backgroundColor: colors.bg.secondary, padding: spacing[5], borderRadius: radius.lg }}>
          <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[4] }}>
            Consistency
          </Text>
          {renderHeatmap()}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[3], gap: spacing[2] }}>
            <View style={{ width: 10, height: 10, backgroundColor: colors.bg.tertiary, borderRadius: 2 }} />
            <Text style={{ ...typography.caption, color: colors.text.muted }}>Rest</Text>
            <View style={{ width: 10, height: 10, backgroundColor: colors.accent.secondary, borderRadius: 2 }} />
            <Text style={{ ...typography.caption, color: colors.text.muted }}>Active</Text>
          </View>
        </View>

        {/* --- RECENT PRs --- */}
        <View style={{ marginTop: spacing[6] }}>
          <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[3] }}>
            Recent Personal Records
          </Text>
          {recentPRs.length === 0 ? (
            <Text style={{ ...typography.body, color: colors.text.muted }}>No records yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[4] }}>
              {recentPRs.map((pr) => (
                <View
                  key={pr.exerciseId}
                  style={{
                    backgroundColor: colors.bg.secondary,
                    padding: spacing[4],
                    borderRadius: radius.md,
                    width: 140,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.accent.primary
                  }}
                >
                  <Text style={{ ...typography.body, fontWeight: '600', color: colors.text.primary, marginBottom: 4 }}>
                    {pr.exerciseName}
                  </Text>
                  <Text style={{ ...typography.h1, fontSize: 24, color: colors.accent.primary }}>
                    {formatWeight(pr.weight, weightUnit)}{pr.weight > 0 && <Text style={{ fontSize: 14 }}>{weightUnit}</Text>}
                  </Text>
                  <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 4 }}>
                    {new Date(pr.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>


        {/* --- VOLUME CHART --- */}
        <View style={{ marginTop: spacing[6], backgroundColor: colors.bg.secondary, padding: spacing[5], borderRadius: radius.lg }}>
          <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[2] }}>
            Volume Load ({weightUnit})
          </Text>

          {weeklyStats.length > 0 ? (
            <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
              <VolumeChart
                data={weeklyStats}
                color={colors.accent.primary}
                textColor={colors.text.muted}
                unit={weightUnit}
              />
            </View>
          ) : (
            <Text style={{ ...typography.body, color: colors.text.muted, paddingVertical: spacing[5] }}>
              Not enough data yet.
            </Text>
          )}
        </View>

      </ScrollView>
    </Screen>
  );
}


import { View, Text, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';

type Props = {
    workoutDates: string[]; // ISO Date strings "YYYY-MM-DD"
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryCalendar({ workoutDates }: Props) {
    const colors = useThemeStore((s) => s.colors);
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Navigation
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calendar Grid Generation
    const calendarGrid = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
        // Adjust so 0 is Monday (if we want Mon-Sun week)
        // Standard JS: 0=Sun. We want 0=Mon? 
        // If 0=Sun, then Mon=1. 
        // Shift: let padded = index - 1. If -1, then 6.
        const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        const days: ({ val: number; matches: boolean } | null)[] = [];

        // Padding
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const iso = new Date(year, month, i).toISOString().split('T')[0];
            // Note: Use local ISO construction to avoid timezone shift issues if simplified.
            // Better:
            const d = new Date(year, month, i); // Local time 00:00
            // To compare with workoutDates, we assume workoutDates are also local string "YYYY-MM-DD".
            // Let's ensure strict formatting.
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${day}`;

            days.push({
                val: i,
                matches: workoutDates.includes(dateStr)
            });
        }

        return days;
    }, [year, month, workoutDates]);

    return (
        <View style={{ marginBottom: spacing[6], backgroundColor: colors.bg.secondary, padding: spacing[4], borderRadius: radius.lg }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                <Pressable onPress={prevMonth} hitSlop={10}>
                    <Text style={{ ...typography.body, color: colors.text.muted }}>←</Text>
                </Pressable>
                <Text style={{ ...typography.h3, color: colors.text.primary }}>{monthLabel}</Text>
                <Pressable onPress={nextMonth} hitSlop={10}>
                    <Text style={{ ...typography.body, color: colors.text.muted }}>→</Text>
                </Pressable>
            </View>

            {/* Weekdays */}
            <View style={{ flexDirection: 'row', marginBottom: spacing[2], justifyContent: 'space-between' }}>
                {WEEKDAYS.map((d, i) => (
                    <Text key={i} style={{ ...typography.caption, color: colors.text.muted, width: 32, textAlign: 'center' }}>{d}</Text>
                ))}
            </View>

            {/* Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>
                {calendarGrid.map((day, i) => (
                    <View key={i} style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                        {day && (
                            <View style={{
                                width: 32,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 16,
                                backgroundColor: day.matches ? colors.accent.primary : 'transparent',
                            }}>
                                <Text style={{
                                    ...typography.bodySm,
                                    color: day.matches ? colors.text.inverse : colors.text.primary,
                                    fontWeight: day.matches ? '700' : '400'
                                }}>
                                    {day.val}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

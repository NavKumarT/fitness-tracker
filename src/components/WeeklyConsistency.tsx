import { View, Text } from 'react-native';

import { useThemeStore } from '../stores/themeStore';
import { typography, spacing, radius } from '../theme/tokens';

type Props = {
    data: { date: Date; hasWorkout: boolean }[];
};

export default function WeeklyConsistency({ data }: Props) {
    const colors = useThemeStore((s) => s.colors);

    const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <View style={{ marginBottom: spacing[6] }}>
            <Text style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing[3], textTransform: 'uppercase', letterSpacing: 1 }}>
                Last 7 Days
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {data.map((day, index) => {
                    const isToday = index === data.length - 1;
                    const label = WEEKDAYS[day.date.getDay()];

                    return (
                        <View key={index} style={{ alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: radius.full,
                                    backgroundColor: day.hasWorkout ? colors.accent.primary : 'transparent',
                                    borderWidth: day.hasWorkout ? 0 : 2,
                                    borderColor: day.hasWorkout
                                        ? 'transparent'
                                        : isToday
                                            ? colors.text.primary // Today empty = brighter border
                                            : colors.border.subtle, // Past empty = dim
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: spacing[2],
                                }}
                            >
                                {day.hasWorkout && (
                                    <Text style={{ color: colors.bg.primary, fontSize: 10, fontWeight: '900' }}>✓</Text>
                                )}
                            </View>
                            <Text style={{
                                ...typography.caption,
                                fontSize: 10,
                                color: isToday ? colors.text.primary : colors.text.muted,
                                fontWeight: isToday ? '700' : '400'
                            }}>
                                {label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

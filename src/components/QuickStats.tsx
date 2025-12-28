import { View, Text } from 'react-native';
import { Flame, Dumbbell, Calendar } from 'lucide-react-native';
import { useThemeStore } from '../stores/themeStore';
import { typography, spacing, radius } from '../theme/tokens';
import { formatWeight } from '../utils/units';

type Props = {
    streak: number;
    workoutsLast7Days: number;
};

export default function QuickStats({ streak, workoutsLast7Days }: Props) {
    const colors = useThemeStore((s) => s.colors);

    const StatItem = ({ icon: Icon, label, value, color }: any) => (
        <View style={{
            flex: 1,
            backgroundColor: colors.bg.secondary,
            borderRadius: radius.md,
            padding: spacing[3],
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border.subtle
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] }}>
                <Icon size={14} color={color} style={{ marginRight: 6 }} />
                <Text style={{ ...typography.caption, color: colors.text.muted }}>{label}</Text>
            </View>
            <Text style={{ ...typography.h3, color: colors.text.primary }}>{value}</Text>
        </View>
    );

    return (
        <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[6] }}>
            <StatItem
                icon={Flame}
                label="Streak"
                value={streak}
                color={colors.semantic.error} // Fire color
            />
            <StatItem
                icon={Calendar}
                label="Last 7 Days"
                value={workoutsLast7Days}
                color={colors.accent.primary}
            />
        </View>
    );
}

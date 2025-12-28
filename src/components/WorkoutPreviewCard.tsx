import { View, Text, Pressable, ScrollView, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import ExerciseIcon from './ExerciseIcon';
import type { UnitExercise } from '../db/trainingUnitExercises';

type Props = {
    title: string;
    subtitle: string;
    exercises: UnitExercise[];
    onAction?: () => void;
    actionLabel?: string;
    isNextUp?: boolean; // Changes styling slightly (e.g. muted)
    style?: ViewStyle;
};

export default function WorkoutPreviewCard({
    title,
    subtitle,
    exercises,
    onAction,
    actionLabel,
    isNextUp = false,
    style,
}: Props) {
    const colors = useThemeStore((s) => s.colors);
    const isMinimalist = useUIStore((s) => s.isMinimalistMode);

    const Content = (
        <>


            <Text style={[typography.h2, { color: colors.text.primary }]}>
                {title}
            </Text>

            <Text
                style={{
                    marginTop: spacing[1],
                    ...typography.body,
                    color: colors.text.muted,
                }}
            >
                {subtitle}
            </Text>

            {/* Exercise Preview Strip */}
            <View style={{ marginTop: spacing[5] }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {exercises.map((ex, i) => (
                        <View key={i} style={{ marginRight: spacing[3], alignItems: 'center', width: 60 }}>
                            <ExerciseIcon
                                muscle={ex.primary_muscle}
                                name={ex.name}
                                imageUrl={ex.image_url}
                                size={50}
                            />
                            <Text
                                numberOfLines={1}
                                style={{
                                    marginTop: spacing[2],
                                    ...typography.caption,
                                    fontSize: 10,
                                    color: colors.text.secondary,
                                    textAlign: 'center'
                                }}
                            >
                                {ex.name}
                            </Text>
                        </View>
                    ))}
                    {exercises.length === 0 && (
                        <Text style={{ ...typography.caption, color: colors.text.muted }}>
                            No exercises configured
                        </Text>
                    )}
                </ScrollView>
            </View>

            {/* Action Button */}
            {onAction && actionLabel && (
                <Pressable
                    onPress={onAction}
                    style={{
                        marginTop: spacing[6],
                        paddingVertical: spacing[3],
                        backgroundColor: isNextUp ? colors.bg.tertiary : colors.accent.primary,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        borderWidth: isNextUp ? 1 : 0,
                        borderColor: isNextUp ? colors.accent.primary + '40' : 'transparent', // Add subtle border
                        // Shadow for button in premium
                        ...(!isMinimalist && !isNextUp && {
                            shadowColor: colors.accent.primary,
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 }
                        })
                    }}
                >
                    <Text
                        style={{
                            ...typography.body,
                            fontWeight: '600',
                            color: isNextUp ? colors.accent.primary : colors.bg.primary, // Make text accent color
                        }}
                    >
                        {actionLabel}
                    </Text>
                </Pressable>
            )}
        </>
    );

    const containerStyle: ViewStyle = {
        borderRadius: radius.lg,
        padding: spacing[5],
        opacity: isNextUp ? 0.9 : 1,
    };

    if (!isMinimalist) {
        return (
            <LinearGradient
                colors={[colors.bg.secondary, colors.bg.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[containerStyle, {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2, // Stronger shadow
                    shadowRadius: 8,
                    elevation: 5,
                }, style]}
            >
                {Content}
            </LinearGradient>
        );
    }

    return (
        <View
            style={[containerStyle, {
                backgroundColor: colors.bg.secondary
            }, style]}
        >
            {Content}
        </View>
    );
}

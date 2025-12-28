
import React, { useEffect } from 'react';
import { Pressable, Text, PressableProps, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native'; // Assuming we use this icon often, or we pass children
import { colors, radius, typography, spacing } from '../theme/tokens';
import { useUIStore } from '../stores/uiStore';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type Props = PressableProps & {
    label: string;
    icon?: React.ReactNode;
    colors?: string[];
    style?: ViewStyle;
};

export function BreathingGradientButton({ label, icon, colors: gradientColors = [colors.accent.primary, colors.accent.secondary], style, ...props }: Props) {
    const isMinimalist = useUIStore((s) => s.isMinimalistMode);

    // Animation Values
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.5);

    useEffect(() => {
        if (isMinimalist) return;

        // Subtle Breathing Scale
        scale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1, // Infinite
            true // Reverse
        );

        // Glow Pulse
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 2000 }),
                withTiming(0.4, { duration: 2000 })
            ),
            -1,
            true
        );
    }, [isMinimalist]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    // Minimalist Render (No animation, simple style)
    if (isMinimalist) {
        return (
            <Pressable
                style={({ pressed }) => [{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: spacing[6],
                    backgroundColor: colors.bg.secondary,
                    borderRadius: radius.full,
                    borderWidth: 1,
                    borderColor: colors.border.subtle,
                    opacity: pressed ? 0.8 : 1,
                }, style]}
                {...props}
            >
                {icon}
                <Text style={{ ...typography.bodySm, fontWeight: '700', color: colors.text.primary, marginLeft: icon ? spacing[2] : 0 }}>
                    {label}
                </Text>
            </Pressable>
        );
    }

    // Premium Render
    return (
        <Animated.View style={[animatedStyle, { position: 'relative', alignItems: 'center', justifyContent: 'center' }, style]}>
            {/* Glow Layer behind */}
            <AnimatedLinearGradient
                colors={gradientColors}
                style={[
                    glowStyle,
                    {
                        position: 'absolute',
                        top: 2, left: 2, right: 2, bottom: 2,
                        borderRadius: radius.full,
                        zIndex: -1,
                        opacity: 0.5,
                        transform: [{ scale: 1.05 }], // Slightly larger for glow
                        blurRadius: 10 // Only works on simplified views, mostly simulating via opacity here on native without expo-blur
                    }
                ]}
            />

            <Pressable {...props} style={{ width: '100%', alignItems: 'center' }}>
                {({ pressed }) => (
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: spacing[6],
                            borderRadius: radius.full,
                            width: '100%',
                            opacity: pressed ? 0.9 : 1,
                            shadowColor: gradientColors[0],
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 8,
                        }}
                    >
                        {icon}
                        <Text style={{ ...typography.bodySm, fontWeight: '700', color: colors.bg.primary, marginLeft: icon ? spacing[2] : 0 }}>
                            {label}
                        </Text>
                    </LinearGradient>
                )}
            </Pressable>
        </Animated.View>
    );
}

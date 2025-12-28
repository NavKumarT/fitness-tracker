
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { X, Lightbulb } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { useUIStore } from '../stores/uiStore';

type Props = {
    message: string;
    onDismiss: () => void;
    delay?: number; // Delay in ms before showing
    style?: ViewStyle;
};

export default function TipCard({ message, onDismiss, delay = 1000, style }: Props) {
    const isMinimalist = useUIStore((s) => s.isMinimalistMode);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!isVisible) return null;

    const Container = isMinimalist ? View : Animated.View;
    const animProps = isMinimalist ? {} : { entering: FadeInDown.springify(), exiting: FadeOutUp };

    return (
        <Container {...animProps} style={[{ marginBottom: spacing[4] }, style]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.bg.secondary,
                borderWidth: 1,
                borderColor: colors.accent.secondary + '40', // Subtle tint
                borderRadius: radius.md,
                padding: spacing[3],
                // Subtle glow in premium
                ...(!isMinimalist && {
                    shadowColor: colors.accent.secondary,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                })
            }}>
                <View style={{
                    width: 32, height: 32,
                    borderRadius: radius.full,
                    backgroundColor: colors.accent.secondary + '20',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: spacing[3]
                }}>
                    <Lightbulb size={18} color={colors.accent.secondary} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ ...typography.caption, color: colors.text.primary, lineHeight: 20, flexWrap: 'wrap' }}>
                        {message}
                    </Text>
                </View>

                <Pressable onPress={onDismiss} hitSlop={12} style={{ marginLeft: spacing[2], padding: 4 }}>
                    <X size={16} color={colors.text.muted} />
                </Pressable>
            </View>
        </Container>
    );
}

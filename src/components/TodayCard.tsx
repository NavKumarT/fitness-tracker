import { View, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function TodayCard({
  title,
  subtitle,
  children,
  style,
}: Props) {
  const colors = useThemeStore((s) => s.colors);
  const isMinimalist = useUIStore((s) => s.isMinimalistMode);

  const containerStyle: ViewStyle = {
    marginTop: spacing[8],
    padding: spacing[6],
    borderRadius: radius.xl,
    // Minimalist: Border + Solid BG
    // Premium: Shadow + Gradient (No border, or glass border)
    backgroundColor: isMinimalist ? colors.bg.secondary : undefined, // Gradient handles BG if premium
    borderWidth: isMinimalist ? 1 : 0,
    borderColor: colors.border.subtle,
    ...(!isMinimalist && {
      shadowColor: colors.accent.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    })
  };

  const Content = (
    <>
      <Text
        style={{
          ...typography.caption,
          color: colors.accent.primary,
          letterSpacing: 1.2,
          fontWeight: '600',
        }}
      >
        TODAY
      </Text>

      <Text
        style={{
          marginTop: spacing[2],
          ...typography.h1,
          color: colors.text.primary,
        }}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={{
            marginTop: spacing[1],
            ...typography.body,
            color: colors.text.secondary,
          }}
        >
          {subtitle}
        </Text>
      )}

      {children}
    </>
  );

  if (!isMinimalist) {
    return (
      <LinearGradient
        colors={[colors.bg.secondary, colors.bg.tertiary]} // Subtle depth
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[containerStyle, style]}
      >
        {/* Glass Border Overlay */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)'
        }} pointerEvents="none" />
        {Content}
      </LinearGradient>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {Content}
    </View>
  );
}

import { Pressable, Text } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/tokens';

export default function Button({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? '#2FBF88'
          : colors.accent.primary,
        paddingVertical: spacing[4],
        borderRadius: radius.md,
        alignItems: 'center',
      })}
    >
      <Text
        style={{
          color: colors.bg.primary,
          ...typography.body,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}


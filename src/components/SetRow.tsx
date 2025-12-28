import { View, TextInput, Text } from 'react-native';
import { typography, spacing, colors } from '../theme/tokens';
import { useUserStore } from '../stores/userStore';
import { formatWeight } from '../utils/units';

type Props = {
  set: {
    id: string;
    weight: number;
    reps: number;
  };
  index: number;
};

export default function SetRow({ set, index }: Props) {
  const weightUnit = useUserStore((s) => s.weightUnit);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[2],
      }}
    >
      {/* Set index */}
      <Text
        style={{
          width: 28,
          ...typography.caption,
          color: colors.text.muted,
        }}
      >
        {index + 1}
      </Text>

      {/* Weight */}
      <View style={{ flex: 1, marginRight: spacing[2] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.bg.tertiary,
          }}
        >
          <TextInput
            defaultValue={set.weight ? formatWeight(set.weight, weightUnit) : ''}
            placeholder="0"
            placeholderTextColor={colors.text.muted}
            keyboardType="numeric"
            style={{
              flex: 1,
              color: colors.text.primary,
              ...typography.body,
              paddingVertical: spacing[1],
            }}
          />
          <Text
            style={{
              marginLeft: spacing[1],
              ...typography.caption,
              color: colors.text.muted,
            }}
          >
            {weightUnit}
          </Text>
        </View>
      </View>

      {/* Reps */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.bg.tertiary,
          }}
        >
          <TextInput
            defaultValue={set.reps ? String(set.reps) : ''}
            placeholder="0"
            placeholderTextColor={colors.text.muted}
            keyboardType="numeric"
            style={{
              flex: 1,
              color: colors.text.primary,
              ...typography.body,
              paddingVertical: spacing[1],
            }}
          />
          <Text
            style={{
              marginLeft: spacing[1],
              ...typography.caption,
              color: colors.text.muted,
            }}
          >
            reps
          </Text>
        </View>
      </View>
    </View>
  );
}

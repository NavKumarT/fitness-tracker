import { View, Text, Pressable } from 'react-native';
import Screen from '../components/Screen';
import { typography, spacing, colors, radius } from '../theme/tokens';
import { createTrainingUnit } from '../db/trainingUnits';

type Props = {
  scheduleId: string;
  onDone: () => void;
};

const DEFAULT_CYCLE = [
  { label: 'Push', isRest: false },
  { label: 'Pull', isRest: false },
  { label: 'Legs', isRest: false },
  { label: 'Rest', isRest: true },
];

export default function CycleSetup({ scheduleId, onDone }: Props) {
  function handleCreateDefault() {
    DEFAULT_CYCLE.forEach((step, index) => {
      createTrainingUnit(
        scheduleId,
        index,
        step.label,
        step.isRest
      );
    });

    onDone();
  }

  return (
    <Screen>
      <View style={{ padding: spacing[5] }}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          Set up your training cycle
        </Text>

        <Text
          style={{
            marginTop: spacing[2],
            ...typography.body,
            color: colors.text.secondary,
          }}
        >
          Define the sequence you repeat.
        </Text>

        <View
          style={{
            marginTop: spacing[6],
            padding: spacing[4],
            backgroundColor: colors.bg.secondary,
            borderRadius: radius.lg,
          }}
        >
          {DEFAULT_CYCLE.map((step, i) => (
            <Text
              key={i}
              style={{
                ...typography.body,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {i + 1}. {step.label}
            </Text>
          ))}
        </View>

        <View style={{ marginTop: spacing[6] }}>
          <Pressable
            onPress={handleCreateDefault}
            style={{
              padding: spacing[4],
              backgroundColor: colors.accent.primary,
              borderRadius: radius.md,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...typography.body,
                fontWeight: '600',
                color: colors.bg.primary,
              }}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

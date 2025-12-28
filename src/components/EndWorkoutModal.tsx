import { View, Text, Pressable, Modal } from 'react-native';
import { typography, spacing, colors, radius } from '../theme/tokens';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export default function EndWorkoutModal({
  visible,
  onConfirm,
  onDiscard,
  onCancel,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Overlay */}
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        {/* Bottom sheet */}
        <Pressable
          onPress={() => { }}
          style={{
            backgroundColor: colors.bg.secondary,
            padding: spacing[5],
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
          }}
        >
          <Text
            style={{
              ...typography.h2,
              color: colors.text.primary,
              textAlign: 'center',
            }}
          >
            Finish Workout?
          </Text>

          <Text
            style={{
              marginTop: spacing[2],
              ...typography.body,
              color: colors.text.muted,
              textAlign: 'center',
            }}
          >
            Good job! How would you like to proceed?
          </Text>

          {/* Actions */}
          <View style={{ marginTop: spacing[6], gap: spacing[3] }}>
            {/* Log & Exit */}
            <Pressable
              onPress={onConfirm}
              style={{
                backgroundColor: colors.accent.primary,
                padding: spacing[4],
                borderRadius: radius.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: colors.bg.primary,
                  fontWeight: '600',
                }}
              >
                Log & Exit
              </Text>
            </Pressable>

            {/* Discard */}
            <Pressable
              onPress={onDiscard}
              style={{
                backgroundColor: 'rgba(227, 91, 91, 0.1)', // Light error bg
                padding: spacing[4],
                borderRadius: radius.md,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: colors.semantic.error,
                  fontWeight: '600',
                }}
              >
                Exit without logging
              </Text>
            </Pressable>

            {/* Cancel / Continue */}
            <Pressable
              onPress={onCancel}
              style={{
                padding: spacing[3],
                alignItems: 'center',
                marginTop: spacing[1],
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                }}
              >
                Continue workout
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

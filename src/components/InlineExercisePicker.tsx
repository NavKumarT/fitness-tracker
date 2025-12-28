import { View, Text, Pressable, FlatList } from 'react-native';
import { typography, spacing, colors, radius } from '../theme/tokens';
import { Exercise } from '../db/exercises';

type Props = {
  exercises: Exercise[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onDone: () => void;
};

export default function InlineExercisePicker({
  exercises,
  selectedIds,
  onToggle,
  onDone,
}: Props) {
  return (
    <View
      style={{
        marginTop: spacing[3],
        padding: spacing[3],
        backgroundColor: colors.bg.tertiary,
        borderRadius: radius.md,
      }}
    >
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.id);

          return (
            <Pressable
              onPress={() => onToggle(item.id)}
              style={{
                paddingVertical: spacing[2],
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: colors.text.primary,
                }}
              >
                {item.name}
              </Text>

              {selected && (
                <Text style={{ color: colors.accent.primary }}>✓</Text>
              )}
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={onDone}
        style={{
          marginTop: spacing[3],
          padding: spacing[3],
          backgroundColor: colors.accent.primary,
          borderRadius: radius.sm,
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
          Done
        </Text>
      </Pressable>
    </View>
  );
}

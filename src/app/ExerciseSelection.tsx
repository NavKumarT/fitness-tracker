import { View, Text, Pressable, FlatList, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react-native';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { getAllExercises, createCustomExercise } from '../db/exercises';
import ExerciseIcon from '../components/ExerciseIcon';

type Props = {
  selectedExerciseIds?: string[];
  onDone: (
    exercises: { id: string; name: string }[]
  ) => void;
  onCancel?: () => void;
};

export default function ExerciseSelection({
  selectedExerciseIds = [],
  onDone,
  onCancel,
}: Props) {
  const colors = useThemeStore((s) => s.colors);

  // Refresh key to force re-fetch from DB when custom exercise is added
  const [refreshKey, setRefreshKey] = useState(0);
  const allExercises = useMemo(() => getAllExercises(), [refreshKey]);

  const [searchQuery, setSearchQuery] = useState('');

  const [selected, setSelected] = useState<
    { id: string; name: string }[]
  >(
    allExercises.filter((e) =>
      selectedExerciseIds.includes(e.id)
    )
  );

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return allExercises;
    const lower = searchQuery.toLowerCase();
    return allExercises.filter(e =>
      e.name.toLowerCase().includes(lower) ||
      (e.aliases && e.aliases.toLowerCase().includes(lower))
    );
  }, [allExercises, searchQuery]);

  function toggle(exercise: {
    id: string;
    name: string;
  }) {
    setSelected((prev) =>
      prev.some((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise]
    );
  }

  function handleCreateCustom() {
    const name = searchQuery.trim();
    if (!name) return;

    const newId = createCustomExercise(name);

    // Force refresh of list to include new item
    setRefreshKey(k => k + 1);

    // Auto-select the new one
    // Note: We need to wait for refresh? No, we can just optimistic add to selected.
    // But we also want it to appear in the list. The refreshKey will handle the list.
    const newEx = { id: newId, name: name };
    setSelected(prev => [...prev, newEx]);

    // Clear search to show the full list (which now contains our new item at top/bottom depending on sort)
    // Actually, maybe keep search matching it? 
    // If I keep search "Rows", and I created "Rows Custom", it will appear in filtered list now.
    // That's nice feedback.
    // Let's NOT clear search.
  }

  return (
    <View style={{ padding: spacing[5], flex: 1 }}>
      <Text style={[typography.h1, { color: colors.text.primary, marginBottom: spacing[5] }]}>
        Select exercises
      </Text>

      {/* Search Bar */}
      <View style={{ marginBottom: spacing[4] }}>
        <TextInput
          placeholder="Search exercises..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            backgroundColor: colors.bg.secondary,
            padding: spacing[4],
            borderRadius: radius.md,
            color: colors.text.primary,
            ...typography.body,
          }}
        />
      </View>

      {/* CUSTOM CREATE ACTION */}
      {searchQuery.trim().length > 0 && (
        <Pressable
          onPress={handleCreateCustom}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[3],
            backgroundColor: colors.bg.secondary,
            borderRadius: radius.md,
            marginBottom: spacing[4],
            opacity: pressed ? 0.7 : 1,
            borderWidth: 1,
            borderColor: colors.accent.primary,
            borderStyle: 'dashed'
          })}
        >
          <View style={{
            width: 32, height: 32,
            backgroundColor: colors.accent.primary + '15',
            borderRadius: radius.sm,
            alignItems: 'center', justifyContent: 'center',
            marginRight: spacing[3]
          }}>
            <Plus size={18} color={colors.accent.primary} />
          </View>
          <View>
            <Text style={{ ...typography.body, fontWeight: '600', color: colors.text.primary }}>
              Create "{searchQuery}"
            </Text>
            <Text style={{ ...typography.caption, color: colors.text.muted }}>
              Tap to add as custom exercise
            </Text>
          </View>
        </Pressable>
      )}

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ padding: spacing[5], alignItems: 'center' }}>
            <Text style={{ ...typography.body, color: colors.text.muted }}>
              No exercises found
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isSelected = selected.some((e) => e.id === item.id);
          return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <Pressable
                onPress={() => toggle(item)}
                style={{
                  paddingVertical: spacing[3],
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: colors.bg.tertiary,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ marginRight: spacing[3] }}>
                    <ExerciseIcon muscle={item.primary_muscle} name={item.name} imageUrl={item.image_url} size={36} />
                  </View>
                  <Text
                    style={{
                      ...typography.body,
                      color: isSelected ? colors.accent.primary : colors.text.primary,
                      flex: 1,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                {isSelected && (
                  <Text style={{ color: colors.accent.primary }}>✓</Text>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />

      <View style={{ paddingVertical: spacing[4] }}>
        <Pressable
          onPress={() => onDone(selected)}
          style={{
            padding: spacing[4],
            backgroundColor: colors.accent.primary,
            borderRadius: 999, // Pill shape
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.bg.primary,
              fontWeight: '600',
              ...typography.body
            }}
          >
            Done ({selected.length})
          </Text>
        </Pressable>

        {onCancel && (
          <Pressable onPress={onCancel} style={{ marginTop: spacing[3] }}>
            <Text
              style={{
                textAlign: 'center',
                color: colors.text.muted,
                ...typography.caption
              }}
            >
              Cancel
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

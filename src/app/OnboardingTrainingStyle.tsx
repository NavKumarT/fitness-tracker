import { View, Text, Pressable } from 'react-native';
import Screen from '../components/Screen';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { getActiveTrainingSchedule } from '../db/trainingSchedules';

type Props = {
  onSelect: (type: 'weekly' | 'cycle' | 'edit_weekly' | 'edit_cycle') => void;
  title?: string;
};

export default function OnboardingTrainingStyle({ onSelect, title }: Props) {
  const colors = useThemeStore((s) => s.colors);

  // Checking active schedule specifically to offer "Edit" option
  // In a real heavy app we might memoize or effect this, but direct sync call is fine here for now.
  const active = getActiveTrainingSchedule();

  return (
    <Screen>
      <View style={{ padding: spacing[5] }}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          {title || "How do you usually train?"}
        </Text>

        <Text
          style={{
            marginTop: spacing[2],
            ...typography.body,
            color: colors.text.secondary,
          }}
        >
          {active ? "Edit your current plan or start a new one." : "You can change this anytime."}
        </Text>

        {/* EDIT ACTIVE OPTION */}
        {active && (
          <Pressable
            onPress={() => onSelect(active.type === 'weekly' ? 'edit_weekly' : 'edit_cycle')}
            style={{
              marginTop: spacing[6],
              padding: spacing[4],
              backgroundColor: colors.bg.secondary,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.accent.primary,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={[typography.h2, { color: colors.accent.primary }]}>
                  Edit Current Plan
                </Text>
                <Text style={{ marginTop: spacing[1], ...typography.caption, color: colors.text.muted }}>
                  {active.name || 'Current Schedule'}
                </Text>
              </View>
              <Text style={{ color: colors.accent.primary }}>✏️</Text>
            </View>
          </Pressable>
        )}

        <Text style={{ marginTop: spacing[6], ...typography.caption, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
          Start New Plan
        </Text>

        {/* Weekly option */}
        <Pressable
          onPress={() => onSelect('weekly')}
          style={{
            marginTop: spacing[3],
            padding: spacing[4],
            backgroundColor: colors.bg.secondary,
            borderRadius: radius.lg,
          }}
        >
          <Text style={[typography.h2, { color: colors.text.primary }]}>
            By weekdays
          </Text>
          <Text
            style={{
              marginTop: spacing[1],
              ...typography.caption,
              color: colors.text.muted,
            }}
          >
            Example: Monday Push, Tuesday Pull
          </Text>
        </Pressable>

        {/* Cycle option */}
        <Pressable
          onPress={() => onSelect('cycle')}
          style={{
            marginTop: spacing[4],
            padding: spacing[4],
            backgroundColor: colors.bg.secondary,
            borderRadius: radius.lg,
          }}
        >
          <Text style={[typography.h2, { color: colors.text.primary }]}>
            In a repeating cycle
          </Text>
          <Text
            style={{
              marginTop: spacing[1],
              ...typography.caption,
              color: colors.text.muted,
            }}
          >
            Example: Push → Pull → Legs → Rest
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

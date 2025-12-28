import { StatusBar, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';
import { spacing } from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  showBackButton?: boolean;
};

export default function Screen({
  children,
  showBackButton,
}: Props) {
  const colors = useThemeStore((s) => s.colors);
  const mode = useThemeStore((s) => s.mode);
  const isMinimalist = useUIStore((s) => s.isMinimalistMode);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const canGoBack = navigation.canGoBack ? navigation.canGoBack() : false;
  const shouldShowBack = showBackButton !== undefined ? showBackButton : canGoBack;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.primary,
      }}
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* PREMIUM BACKGROUND GRADIENT (Global) */}
      {/* Positioned absolutely as the first child, so it renders behind the content (siblings) but above the background */}
      {!isMinimalist && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
          <LinearGradient
            colors={[colors.accent.primary + '30', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 350 }}
          />
          <LinearGradient
            colors={['transparent', colors.accent.primary + '10']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 }}
          />
        </View>
      )}

      {/* Safe Area Wrapper */}
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {shouldShowBack && (
          <View style={{
            paddingHorizontal: spacing[5],
            paddingTop: spacing[2],
            paddingBottom: spacing[2],
            zIndex: 10,
            elevation: 5, // Android z-index fix
          }}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={16}
            >
              <ChevronLeft color={colors.text.primary} size={28} />
            </Pressable>
          </View>
        )}

        {children}
      </View>
    </View>
  );
}


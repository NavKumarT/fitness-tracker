import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, History, BarChart2, User } from 'lucide-react-native';
import { useThemeStore } from '../stores/themeStore';
import { useUIStore } from '../stores/uiStore';

import HomeStack from './HomeStack';
import HistoryStack from './HistoryStack';
import InsightsStack from './InsightsStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const colors = useThemeStore((s) => s.colors);
  const isMinimalist = useUIStore((s) => s.isMinimalistMode);

  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: colors.bg.primary,
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isMinimalist ? colors.bg.primary : 'transparent',
          borderTopWidth: isMinimalist ? 1 : 0,
          borderTopColor: colors.bg.tertiary,
          elevation: 0,
          position: isMinimalist ? 'relative' : 'absolute',
          ...(!isMinimalist && {
            bottom: 0,
            left: 0,
            right: 0,
            // Allow some height for the gradient to breathe
            height: 90,
            paddingTop: 10,
          }),
        },
        tabBarBackground: () => (
          !isMinimalist && (
            <LinearGradient
              // Transparent -> Semi-Opaque -> Solid
              colors={[colors.bg.primary + '00', colors.bg.primary + 'E6', colors.bg.primary]}
              locations={[0, 0.4, 1]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
          )
        ),
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsStack}
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

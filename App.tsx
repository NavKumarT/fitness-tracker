import { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { initDb } from './src/db';
import { useWorkoutStore } from './src/stores/workoutStores';
import { useThemeStore } from './src/stores/themeStore';

export default function App() {
  const hydrateWorkout = useWorkoutStore((s) => s.hydrate);
  const colors = useThemeStore((s) => s.colors);
  const mode = useThemeStore((s) => s.mode);

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    try {
      if (Platform.OS === 'android') {
        NavigationBar.setPositionAsync('absolute');
        NavigationBar.setBackgroundColorAsync('#ffffff00');
      }
      initDb();
      hydrateWorkout();
      setDbReady(true);
    } catch (e) {
      console.error('DB init failed', e);
    }
  }, []);

  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg.primary,
      card: colors.bg.primary,
      border: colors.bg.tertiary,
      text: colors.text.primary,
    },
  };

  if (!dbReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

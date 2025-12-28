import { useEffect, useState } from 'react';
import BottomTabs from './BottomTabs';
import WelcomeScreen from '../app/WelcomeScreen';
import { useAuthStore } from '../stores/authStore';

export default function RootNavigator() {
  // We need to wait for hydration
  const [isReady, setIsReady] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Basic hydration check - zustand persist usually handles this, 
    // but we want to avoid flicker. 
    // For now, let's just assume ready immediately or add a small timeout if needed.
    // Zustand persist is async by default with AsyncStorage.
    // We can use onFinish in persist options, but for simplicity:
    setIsReady(true);
  }, []);

  if (!isReady) return null; // Or Splash

  if (!user) {
    return <WelcomeScreen />;
  }

  return <BottomTabs />;
}

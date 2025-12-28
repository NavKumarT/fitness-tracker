import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../app/Profile';
import OnboardingTrainingStyleScreen from '../app/OnboardingTrainingStyleScreen';
import WeeklyScheduleBuilder from '../app/WeeklyScheduleBuilder';
import CycleBuilder from '../app/CycleBuilder';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="OnboardingTrainingStyle" component={OnboardingTrainingStyleScreen} />
      <Stack.Screen name="WeeklyScheduleBuilder" component={WeeklyScheduleBuilder} />
      <Stack.Screen name="CycleBuilder" component={CycleBuilder} />
    </Stack.Navigator>
  );
}

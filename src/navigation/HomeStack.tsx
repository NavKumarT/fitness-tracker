import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../app/Home';
import Workout from '../app/Workout';
import WorkoutSummary from '../app/WorkoutSummary';
import WeeklyScheduleBuilder from '../app/WeeklyScheduleBuilder';
import CycleBuilder from '../app/CycleBuilder';
import OnboardingTrainingStyleScreen from '../app/OnboardingTrainingStyleScreen';
import ScheduleViewer from '../app/ScheduleViewer';

import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Workout" component={Workout} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummary} />
      <Stack.Screen
        name="OnboardingTrainingStyle"
        component={OnboardingTrainingStyleScreen}
      />
      <Stack.Screen
        name="WeeklyScheduleBuilder"
        component={WeeklyScheduleBuilder}
      />
      <Stack.Screen name="CycleBuilder" component={CycleBuilder} />
      <Stack.Screen name="ScheduleViewer" component={ScheduleViewer} />
    </Stack.Navigator>
  );
}

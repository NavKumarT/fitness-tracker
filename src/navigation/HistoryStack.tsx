import { createNativeStackNavigator } from '@react-navigation/native-stack';

import History from '../app/History';
import WorkoutHistoryDetail from '../app/WorkoutHistoryDetail';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export default function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen
        name="History"
        component={History}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WorkoutHistoryDetail"
        component={WorkoutHistoryDetail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

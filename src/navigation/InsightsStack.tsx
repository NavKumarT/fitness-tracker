import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Insights from '../app/Insights';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export default function InsightsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="Insights" component={Insights} />
    </Stack.Navigator>
  );
}

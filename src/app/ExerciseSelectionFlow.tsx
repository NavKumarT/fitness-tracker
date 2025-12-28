// import { useEffect } from 'react';
// import { View } from 'react-native';
// import {
//   useNavigation,
//   useRoute,
//   RouteProp,
// } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// import ExerciseSelection from './ExerciseSelection';
// import { getTrainingUnitsForSchedule } from '../db/trainingUnits';
// import type { RootStackParamList } from '../navigation/RootNavigator';
// import type { TrainingUnit } from '../db/types';

// type RouteProps = RouteProp<
//   RootStackParamList,
//   'ExerciseSelection'
// >;

// type NavProps = NativeStackNavigationProp<
//   RootStackParamList,
//   'ExerciseSelection'
// >;

// export default function ExerciseSelectionFlow() {
//   const navigation = useNavigation<NavProps>();
//   const route = useRoute<RouteProps>();

//   const { scheduleId, unitIndex } = route.params;

//   const units = getTrainingUnitsForSchedule(
//     scheduleId
//   ) as TrainingUnit[];

//   const currentUnit = units[unitIndex];

//   useEffect(() => {
//     // Finished all units → exit onboarding
//     if (!currentUnit) {
//       navigation.navigate('Home');
//       return;
//     }

//     // Skip rest days safely
//     if (currentUnit.is_rest === 1) {
//       navigation.navigate('ExerciseSelection', {
//         scheduleId,
//         unitIndex: unitIndex + 1,
//       });
//     }
//   }, [currentUnit, navigation, scheduleId, unitIndex]);

//   // While navigation resolves
//   if (!currentUnit || currentUnit.is_rest === 1) {
//     return <View />;
//   }

//   return (
//     <ExerciseSelection
//       trainingUnitId={currentUnit.id}
//       onDone={() => {
//         navigation.navigate('ExerciseSelection', {
//           scheduleId,
//           unitIndex: unitIndex + 1,
//         });
//       }}
//     />
//   );
// }

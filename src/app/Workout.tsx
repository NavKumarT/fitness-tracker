// import { useEffect, useState } from 'react';
// import { View, Text, ScrollView } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// import Screen from '../components/Screen';
// import WorkoutExerciseBlock from '../components/WorkoutExerciseBlock';
// import EndWorkoutModal from '../components/EndWorkoutModal';

// import { useWorkoutStore } from '../stores/workoutStores';
// import { typography, spacing, colors } from '../theme/tokens';

// import { getWorkoutExercises } from '../db/workoutExercises';
// import { endWorkout } from '../db/workouts';

// type WorkoutExercise = {
//   id: string;
//   name: string;
// };

// export default function Workout() {
//   const navigation = useNavigation();

//   const activeWorkoutId = useWorkoutStore((s) => s.activeWorkoutId);
//   const clearActiveWorkout = useWorkoutStore((s) => s.endWorkout);

//   const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
//   const [showEndModal, setShowEndModal] = useState(false);

//   useEffect(() => {
//     if (!activeWorkoutId) return;

//     const rows = getWorkoutExercises(activeWorkoutId);
//     setExercises(rows);
//   }, [activeWorkoutId]);

//   function handleEndWorkout() {
//     if (!activeWorkoutId) return;

//     endWorkout(activeWorkoutId);
//     clearActiveWorkout();

//     navigation.navigate(
//       'WorkoutSummary' as never,
//       { workoutId: activeWorkoutId } as never
//     );
//   }

//   /* ---------- SAFETY FALLBACK ---------- */
//   if (!activeWorkoutId) {
//     return (
//       <Screen>
//         <View style={{ padding: spacing[5] }}>
//           <Text
//             style={[
//               typography.h2,
//               { color: colors.text.primary },
//             ]}
//           >
//             No active workout
//           </Text>
//         </View>
//       </Screen>
//     );
//   }

//   /* ---------- RENDER ---------- */
//   return (
//     <Screen>
//       <ScrollView
//         contentContainerStyle={{
//           padding: spacing[5],
//           paddingBottom: spacing[8], // allows last set to be reachable
//         }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <Text
//           style={[
//             typography.h1,
//             { color: colors.text.primary },
//           ]}
//         >
//           Workout
//         </Text>

//         {/* Exercise list */}
//         <View style={{ marginTop: spacing[6] }}>
//           {exercises.length === 0 && (
//             <View
//               style={{
//                 padding: spacing[4],
//                 backgroundColor: colors.bg.secondary,
//                 borderRadius: 12,
//               }}
//             >
//               <Text
//                 style={{
//                   ...typography.caption,
//                   color: colors.text.muted,
//                 }}
//               >
//                 No exercises in this workout
//               </Text>
//             </View>
//           )}

//           {exercises.map((exercise) => (
//             <WorkoutExerciseBlock
//               key={exercise.id}
//               workoutExerciseId={exercise.id}
//               exerciseName={exercise.name}
//             />
//           ))}
//         </View>

//         {/* End workout */}
//         <View style={{ marginTop: spacing[8] }}>
//           <Text
//             onPress={() => setShowEndModal(true)}
//             style={{
//               ...typography.body,
//               color: colors.semantic.error,
//               textAlign: 'center',
//             }}
//           >
//             End Workout
//           </Text>
//         </View>

//         <EndWorkoutModal
//           visible={showEndModal}
//           onCancel={() => setShowEndModal(false)}
//           onConfirm={() => {
//             setShowEndModal(false);
//             handleEndWorkout();
//           }}
//         />
//       </ScrollView>
//     </Screen>
//   );
// }


import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Keyboard, KeyboardAvoidingView, Platform, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Screen from '../components/Screen';
import WorkoutExerciseBlock from '../components/WorkoutExerciseBlock';
import EndWorkoutModal from '../components/EndWorkoutModal';
import ExerciseSelection from './ExerciseSelection';

import { useWorkoutStore } from '../stores/workoutStores';
import { typography, spacing } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';

import { getWorkoutExercises } from '../db/workoutExercises';
import { endWorkout, addExercisesToWorkout, discardWorkout } from '../db/workouts';

type WorkoutExercise = {
  id: string;
  name: string;
  primary_muscle: string;
  image_url?: string;
  exercise_id: string;
};

export default function Workout() {
  const navigation = useNavigation();
  const activeWorkoutId = useWorkoutStore((s) => s.activeWorkoutId);
  const clearActiveWorkout = useWorkoutStore((s) => s.endWorkout);

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!activeWorkoutId) return;
    setExercises(getWorkoutExercises(activeWorkoutId));
  }, [activeWorkoutId]);

  function handleAddExercises(selected: { id: string; name: string }[]) {
    if (!activeWorkoutId) return;
    const ids = selected.map(s => s.id);
    addExercisesToWorkout(activeWorkoutId, ids);
    // Refresh
    setExercises(getWorkoutExercises(activeWorkoutId));
  }

  function handleDiscardWorkout() {
    if (!activeWorkoutId) return;

    discardWorkout(activeWorkoutId);
    clearActiveWorkout();
    navigation.goBack();
  }

  function handleEndWorkout() {
    if (!activeWorkoutId) return;

    endWorkout(activeWorkoutId);
    clearActiveWorkout();

    navigation.navigate(
      'WorkoutSummary' as never,
      { workoutId: activeWorkoutId } as never
    );
  }

  /* ---------- RENDER ---------- */
  const colors = useThemeStore((s) => s.colors);

  if (!activeWorkoutId) {
    return (
      <Screen>
        <View style={{ padding: spacing[5] }}>
          <Text style={[typography.h2, { color: colors.text.primary }]}>
            No active workout
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing[5],
            paddingBottom: spacing[10] + 50, // Extra padding
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[typography.h1, { color: colors.text.primary }]}>
            Workout
          </Text>

          {/* Exercise list */}
          <View style={{ marginTop: spacing[6] }}>
            {exercises.length === 0 && (
              <View
                style={{
                  padding: spacing[6],
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: spacing[4],
                }}
              >
                <Text
                  style={{
                    ...typography.h2,
                    color: colors.text.primary,
                    textAlign: 'center',
                    marginBottom: spacing[2],
                  }}
                >
                  Ad-hoc Session
                </Text>
                <Text
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    textAlign: 'center',
                  }}
                >
                  This workout is empty. Add exercises to get started.
                </Text>
              </View>
            )}

            {exercises.map((exercise) => (
              <WorkoutExerciseBlock
                key={exercise.id}
                workoutExerciseId={exercise.id}
                exerciseId={exercise.exercise_id}
                exerciseName={exercise.name}
                muscle={exercise.primary_muscle}
                imageUrl={exercise.image_url}
              />
            ))}

            {/* Add Exercise Button */}
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={{
                marginTop: spacing[2],
                paddingVertical: spacing[3],
                borderWidth: 1,
                borderColor: colors.accent.primary,
                borderRadius: 8,
                alignItems: 'center',
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: colors.accent.primary,
                }}
              >
                + Add Exercises
              </Text>
            </Pressable>
          </View>

          {/* End workout */}
          <View style={{ marginTop: 60 }}>
            <Text
              onPress={() => {
                Keyboard.dismiss();
                setShowEndModal(true);
              }}
              style={{
                ...typography.body,
                color: colors.semantic.error,
                textAlign: 'center',
              }}
            >
              End Workout
            </Text>
          </View>

          <EndWorkoutModal
            visible={showEndModal}
            onCancel={() => setShowEndModal(false)}
            onConfirm={() => {
              setShowEndModal(false);
              handleEndWorkout();
            }}
            onDiscard={() => {
              setShowEndModal(false);
              handleDiscardWorkout();
            }}
          />

          <Modal
            visible={showAddModal}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
              <ExerciseSelection
                selectedExerciseIds={exercises.map(e => e.id)} // Actually, checking by ID might be tricky if one exercise is added multiple times? But for now it's fine.
                onDone={(selected) => {
                  // We only want to add the NEW ones? Or does ExerciseSelection return ALL selected?
                  // ExerciseSelection returns ALL selected.
                  // But wait, existing logic in ExerciseSelection initializes with "selectedExerciseIds".
                  // Logic in handleAddExercises needs to figure out diff OR we change ExerciseSelection to just be a "picker" that returns what you tap.
                  // Actually, simplified approach:
                  // The user selects NEW exercises to add.
                  // But ExerciseSelection is built to "manage selection".
                  // Let's refactor the usage slightly:
                  // We will pass empty `selectedExerciseIds` so it acts like a fresh picker.
                  // And we add whatever is returned.
                  handleAddExercises(selected);
                  setShowAddModal(false);
                }}
                onCancel={() => setShowAddModal(false)}
              />
            </SafeAreaView>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

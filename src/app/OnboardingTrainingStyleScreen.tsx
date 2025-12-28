import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import OnboardingTrainingStyle from '../app/OnboardingTrainingStyle';
import { getActiveTrainingSchedule } from '../db/trainingSchedules';

type ParamList = {
  OnboardingTrainingStyle: { title?: string };
};

export default function OnboardingTrainingStyleScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'OnboardingTrainingStyle'>>();
  const title = route.params?.title;

  function handleSelect(type: 'weekly' | 'cycle' | 'edit_weekly' | 'edit_cycle') {
    if (type === 'weekly') {
      navigation.navigate('WeeklyScheduleBuilder' as never);
    }

    if (type === 'cycle') {
      navigation.navigate('CycleBuilder' as never);
    }

    if (type === 'edit_weekly') {
      const active = getActiveTrainingSchedule();
      if (active) navigation.navigate('WeeklyScheduleBuilder', { scheduleId: active.id } as never);
    }

    if (type === 'edit_cycle') {
      const active = getActiveTrainingSchedule();
      if (active) navigation.navigate('CycleBuilder', { scheduleId: active.id } as never);
    }
  }

  return <OnboardingTrainingStyle onSelect={handleSelect} title={title} />;
}

import { View, Text, Switch, Pressable, Image, ScrollView } from 'react-native';
import Screen from '../components/Screen';
import { typography, spacing, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { getActiveTrainingSchedule } from '../db/trainingSchedules';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SyncService } from '../services/SyncService';
import { FEATURES } from '../config/featureFlags';

import { useNavigation } from '@react-navigation/native';

import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';

export default function Profile() {
  const navigation = useNavigation();
  const colors = useThemeStore((s) => s.colors);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isMinimalist = useUIStore((s) => s.isMinimalistMode);
  const toggleMinimalist = useUIStore((s) => s.toggleMinimalistMode);

  const weightUnit = useUserStore((s) => s.weightUnit);
  const toggleWeightUnit = useUserStore((s) => s.toggleWeightUnit);

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const updateUser = useAuthStore((s) => s.updateUser); // Need this action

  // Connect Logic
  const handleConnectAccount = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const googleUser = response.data?.user;

      if (googleUser && user && user.isGuest) {
        // 1. Merge Data
        await SyncService.mergeAccount(user.id, googleUser.id);

        // 2. Update Local User State
        updateUser({
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name ?? user.name,
          photoUrl: googleUser.photo ?? user.photoUrl,
          isGuest: false,
          provider: 'google'
        });

        // 3. Trigger Sync
        await SyncService.pushChanges();
      }
    } catch (error) {
      console.error('Connect failed', error);
      // Handle cancellation/error
    }
  };

  return (
    <Screen showBackButton={false}>
      <ScrollView contentContainerStyle={{ padding: spacing[5], paddingBottom: spacing[10] }}>
        <Text style={[typography.h1, { color: colors.text.primary }]}>
          Profile
        </Text>

        {/* User Card */}
        {user && (
          <View style={{ marginTop: spacing[6], alignItems: 'center' }}>
            {user.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={{ width: 100, height: 100, borderRadius: 50, marginBottom: spacing[3] }}
              />
            ) : (
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.accent.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] }}>
                <Text style={{ fontSize: 40, color: colors.bg.primary }}>
                  {user.name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}

            <Text style={{ ...typography.h2, color: colors.text.primary }}>{user.name}</Text>

            {FEATURES.ENABLE_CLOUD_SYNC ? (
              user.isGuest ? (
                <View style={{ marginTop: spacing[2], alignItems: 'center' }}>
                  <Text style={{ ...typography.caption, color: colors.semantic.warning }}>
                    Guest Account (Offline)
                  </Text>
                  <Pressable
                    onPress={handleConnectAccount}
                    style={{ marginTop: spacing[2] }}
                  >
                    <Text style={{ ...typography.bodySm, color: colors.accent.primary, fontWeight: '600' }}>
                      Connect to Cloud &rarr;
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[2] }}>
                  <Text style={{ ...typography.caption, color: colors.semantic.success }}>
                    ● Cloud Synced
                  </Text>
                </View>
              )
            ) : (
              <View style={{ marginTop: spacing[3], alignItems: 'center', backgroundColor: colors.bg.secondary, padding: spacing[3], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.subtle }}>
                <Text style={{ ...typography.bodySm, fontWeight: '600', color: colors.text.primary }}>
                  Cloud Sync Coming Soon
                </Text>
                <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 4, textAlign: 'center' }}>
                  We are working on syncing your data across devices. Stay tuned!
                </Text>
              </View>
            )}

            {!user.isGuest && <Text style={{ ...typography.body, color: colors.text.muted, marginTop: 4 }}>{user.email}</Text>}
          </View>
        )}

        {/* Training Plan Block */}
        <View style={{ marginTop: spacing[6] }}>
          <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[4] }}>
            Training Plan
          </Text>

          <Pressable
            onPress={() => (navigation as any).navigate('OnboardingTrainingStyle', { title: 'Change your training style' })}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              padding: spacing[4],
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border.subtle,
            }}
          >
            <View>
              <Text style={{ ...typography.body, color: colors.text.primary }}>
                Change / Create Plan
              </Text>
              <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 4 }}>
                Start a new training schedule
              </Text>
            </View>
            <Text style={{ fontSize: 20, color: colors.text.muted }}>→</Text>
          </Pressable>
        </View>

        {/* Settings Block */}
        <View style={{ marginTop: spacing[6] }}>
          <Text style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing[4] }}>
            App Preferences
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              padding: spacing[4],
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border.subtle,
            }}
          >
            <View>
              <Text style={{ ...typography.body, color: colors.text.primary }}>
                Dark Mode
              </Text>
              <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 4 }}>
                {mode === 'dark' ? 'On' : 'Off'}
              </Text>
            </View>

            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.bg.tertiary, true: colors.accent.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* Minimalist Mode Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              padding: spacing[4],
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border.subtle,
              marginTop: spacing[3],
            }}
          >
            <View>
              <Text style={{ ...typography.body, color: colors.text.primary }}>
                Minimalist Mode
              </Text>
              <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 4 }}>
                {isMinimalist ? 'Active' : 'Off (Show Premium UX)'}
              </Text>
            </View>

            <Switch
              value={isMinimalist}
              onValueChange={toggleMinimalist}
              trackColor={{ false: colors.bg.tertiary, true: colors.accent.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* Unit System Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.bg.secondary,
              padding: spacing[4],
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border.subtle,
              marginTop: spacing[3],
            }}
          >
            <View>
              <Text style={{ ...typography.body, color: colors.text.primary }}>
                Use Kilograms (kg)
              </Text>
              <Text style={{ ...typography.caption, color: colors.text.muted, marginTop: 4 }}>
                {weightUnit === 'kg' ? 'Active' : 'Using Pounds (lbs)'}
              </Text>
            </View>

            <Switch
              value={weightUnit === 'kg'}
              onValueChange={toggleWeightUnit}
              trackColor={{ false: colors.bg.tertiary, true: colors.accent.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>


        {/* Sign Out */}
        {/* Sign Out */}
        <Pressable
          onPress={signOut}
          style={{
            marginTop: spacing[6],
            padding: spacing[4],
            backgroundColor: colors.bg.secondary,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.semantic.error,
            alignItems: 'center'
          }}
        >
          <Text style={{ ...typography.body, fontWeight: '600', color: colors.semantic.error }}>
            Sign Out
          </Text>
        </Pressable>

      </ScrollView>
    </Screen >
  );
}

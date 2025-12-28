import { useEffect, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import Screen from '../components/Screen';
import { spacing, typography, colors, radius } from '../theme/tokens';
import { useAuthStore } from '../stores/authStore';
import * as Crypto from 'expo-crypto';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { SyncService } from '../services/SyncService';
import { FEATURES } from '../config/featureFlags';

export default function WelcomeScreen() {
    const signIn = useAuthStore((s) => s.signIn);
    const [name, setName] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '708122173666-j8a27svfr8jq5m9lsv5k80sfhm634fgq.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleGetStarted = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your name to continue.');
            return;
        }

        const guestId = Crypto.randomUUID();
        signIn({
            id: guestId,
            name: name.trim(),
            isGuest: true,
            provider: 'local',
        });
    };

    const handleGoogleLogin = async () => {
        setIsSigningIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            const user = response.data?.user;

            if (user) {
                // If we had a guest session before this (unlikely on WelcomeScreen but useful pattern), we'd merge.
                // Here we just sign them in directly.
                signIn({
                    id: user.id,
                    email: user.email,
                    name: user.name ?? 'User',
                    photoUrl: user.photo ?? undefined,
                    isGuest: false,
                    provider: 'google'
                });

                // Trigger Sync immediately
                setTimeout(() => SyncService.pushChanges(), 1000);
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // cancelled
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available');
            } else {
                console.error(error);
                Alert.alert('Error', 'Login failed');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <Screen showBackButton={false}>
            <View style={{ flex: 1, justifyContent: 'center', padding: spacing[6] }}>
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={{ marginBottom: spacing[8], alignItems: 'center' }}
                >
                    {/* Consistent Funky Branding */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] }}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={{ width: 48, height: 48, resizeMode: 'contain', marginRight: spacing[3] }}
                        />
                        <Text style={{
                            fontSize: 32,
                            fontWeight: '900',
                            fontStyle: 'italic',
                            color: colors.accent.primary,
                            letterSpacing: -1
                        }}>
                            RepRecord
                        </Text>
                    </View>

                    <Text style={{ ...typography.body, color: colors.text.muted, textAlign: 'center', marginTop: spacing[2] }}>
                        Your personal fitness journey starts here.
                        No account required.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginBottom: spacing[6] }}>
                    <Text style={{ ...typography.bodySm, marginBottom: spacing[2], color: colors.text.secondary }}>
                        What should we call you?
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Your Name"
                        placeholderTextColor={colors.text.muted}
                        style={{
                            backgroundColor: colors.bg.secondary,
                            borderRadius: radius.md,
                            padding: spacing[4],
                            color: colors.text.primary,
                            fontSize: 18,
                            borderWidth: 1,
                            borderColor: colors.border.subtle,
                        }}
                        autoFocus
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <Pressable
                        onPress={handleGetStarted}
                        style={({ pressed }) => ({
                            backgroundColor: colors.accent.primary,
                            paddingVertical: spacing[4],
                            borderRadius: radius.md,
                            alignItems: 'center',
                            opacity: pressed ? 0.9 : 1,
                        })}
                    >
                        <Text style={{ ...typography.body, fontWeight: '700', color: colors.bg.primary }}>
                            Get Started
                        </Text>
                    </Pressable>
                </Animated.View>

                {FEATURES.ENABLE_CLOUD_SYNC && (
                    <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: spacing[8], alignItems: 'center' }}>
                        <Text style={{ ...typography.caption, color: colors.text.muted }}>
                            Want to sync your data across devices?
                        </Text>
                        <Pressable
                            onPress={handleGoogleLogin}
                            disabled={isSigningIn}
                            style={{ marginTop: spacing[2], flexDirection: 'row', alignItems: 'center' }}
                        >
                            {isSigningIn ? (
                                <ActivityIndicator size="small" color={colors.accent.primary} style={{ marginRight: 8 }} />
                            ) : null}
                            <Text style={{ ...typography.caption, color: colors.accent.primary, fontWeight: '600' }}>
                                {isSigningIn ? 'Signing In...' : 'Sign in to Sync'}
                            </Text>
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </Screen>
    );
}

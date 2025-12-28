import { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Screen from '../components/Screen';
import { spacing, typography, colors, radius } from '../theme/tokens';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen() {
    const signIn = useAuthStore((s) => s.signIn);
    const [isSigningIn, setIsSigningIn] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            // Ensure you create a "Web Client ID" in GCP and put it here.
            // This allows you to get an ID Token to verify on backend if needed, 
            // and often required for the config to work properly even for just profile info on Android.
            webClientId: '708122173666-j8a27svfr8jq5m9lsv5k80sfhm634fgq.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const handleGoogleLogin = async () => {
        setIsSigningIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            // @react-native-google-signin/google-signin v11+ structure
            const user = response.data?.user;

            if (user) {
                signIn({
                    id: user.id,
                    email: user.email,
                    name: user.name ?? 'User',
                    photoUrl: user.photo ?? undefined,
                });
            } else {
                Alert.alert('Error', 'Could not get user info');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available or outdated');
            } else {
                console.error('Login Error:', error);
                Alert.alert('Error', 'Login failed. Check console for details.');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <Screen showBackButton={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] }}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 120, height: 120, marginBottom: spacing[4] }}
                    resizeMode="contain"
                />
                <Text style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing[2], textAlign: 'center' }}>
                    RepRecord
                </Text>
                <Text style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing[8], textAlign: 'center' }}>
                    Track your workouts, visualize progress, and stay consistent.
                </Text>

                <Pressable
                    disabled={isSigningIn}
                    onPress={handleGoogleLogin}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.bg.secondary,
                        paddingVertical: spacing[4],
                        paddingHorizontal: spacing[6],
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: colors.border.subtle,
                        opacity: isSigningIn ? 0.7 : 1,
                    }}
                >
                    {isSigningIn ? (
                        <ActivityIndicator color={colors.text.primary} style={{ marginRight: spacing[3] }} />
                    ) : (
                        <Text style={{ fontSize: 24, marginRight: spacing[3] }}>G</Text>
                    )}
                    <Text style={{ ...typography.body, fontWeight: '600', color: colors.text.primary }}>
                        {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => signIn({ id: 'guest', name: 'Guest User', email: 'guest@example.com', photoUrl: undefined })}
                    style={{ marginTop: spacing[6] }}
                >
                    <Text style={{ ...typography.caption, color: colors.text.muted }}>
                        Continue as Guest (Dev Only)
                    </Text>
                </Pressable>
            </View>
        </Screen>
    );
}

import { View } from 'react-native';
import { Image } from 'expo-image';
import { typography, radius } from '../theme/tokens';
import { useThemeStore } from '../stores/themeStore';

type Props = {
    muscle?: string;
    name?: string;
    imageUrl?: string;
    size?: number;
};

export default function ExerciseIcon({ muscle, name, imageUrl, size = 40 }: Props) {
    const colors = useThemeStore((s) => s.colors);

    // Priority: 1. Specific URL (from DB) 2. Seeded Placeholder 3. Muscle Fallback
    // Note: For now, we prefer the specific URL if available.
    const uri = imageUrl || `https://picsum.photos/seed/${name ? name.replace(/\s+/g, '') : (muscle || 'fitness')}/200`;

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: radius.md,
                backgroundColor: colors.bg.tertiary,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
            }}
        >
            <Image
                source={imageUrl ? { uri: imageUrl } : { uri }}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                contentFit="contain"
                transition={250}
                tintColor={imageUrl ? colors.text.primary : undefined}
            />
        </View>
    );
}

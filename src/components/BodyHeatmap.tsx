import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Body from 'react-native-body-highlighter';
import { useThemeStore } from '../stores/themeStore';
import { typography, spacing, radius } from '../theme/tokens';
import type { MuscleVolume } from '../db/stats';

// Mapping from our DB 'primary_muscle' to the library's slugs
const MUSCLE_SLUG_MAP: Record<string, string[]> = {
    'Chest': ['chest'],
    'Back': ['trapezius', 'upper-back', 'lower-back'],
    'Shoulders': ['front-deltoids', 'back-deltoids'],
    'Arms': ['biceps', 'triceps', 'forearm'],
    'Biceps': ['biceps'],
    'Triceps': ['triceps'],
    'Forearms': ['forearm'],
    'Core': ['abs', 'obliques'],
    'Legs': ['quadriceps', 'hamstring', 'calves', 'adductor', 'gluteal']
};

function getColor(volume: number) {
    if (volume === 0) return "#E5E7EB"; // Gray (Fresh/Inactive)
    return "#F43F5E"; // Red (Trained/Active)
}

type BodyHeatmapProps = {
    data: MuscleVolume[];
};

export default function BodyHeatmap({ data }: BodyHeatmapProps) {
    console.log('BodyHeatmap render. Data received:', JSON.stringify(data));
    const colors = useThemeStore((s) => s.colors);
    const [side, setSide] = useState<'front' | 'back'>('front');

    const bodyPartData = useMemo(() => {
        // We use the library's 'colors' prop to map intensity:
        // intensity 0 -> First color (Gray/Fresh)
        // intensity 1 -> Second color (Red/Trained)
        const list: { slug: any; intensity: number }[] = [];

        Object.keys(MUSCLE_SLUG_MAP).forEach(muscleKey => {
            const slugs = MUSCLE_SLUG_MAP[muscleKey];
            const item = data.find(d => d.muscle === muscleKey);
            const volume = item ? item.volume : 0;

            // Binary logic: Trained = 1, Fresh = 0
            const intensity = volume > 0 ? 1 : 0;

            if (slugs) {
                slugs.forEach(slug => {
                    const dataPoint: any = { slug: slug as any, intensity };
                    if (intensity === 1) {
                        dataPoint.styles = { fill: '#F43F5E' };
                        dataPoint.color = '#F43F5E';
                    }
                    list.push(dataPoint);
                });
            }
        });

        console.log('Transformed BodyPartData:', JSON.stringify(list));
        return list;
    }, [data]);

    return (
        <View style={{ width: '100%', alignItems: 'center', overflow: 'hidden' }}>

            {/* View Toggle */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: colors.bg.tertiary,
                borderRadius: radius.full,
                padding: 4,
                marginBottom: spacing[4],
                zIndex: 100,
            }}>
                <Pressable
                    onPress={() => setSide('front')}
                    style={{
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        backgroundColor: side === 'front' ? colors.bg.secondary : 'transparent',
                        borderRadius: radius.full,
                        borderWidth: side === 'front' ? 1 : 0,
                        borderColor: colors.border.subtle,
                    }}
                >
                    <Text style={{
                        ...typography.caption,
                        fontWeight: '600',
                        color: side === 'front' ? colors.text.primary : colors.text.muted
                    }}>Front</Text>
                </Pressable>
                <Pressable
                    onPress={() => setSide('back')}
                    style={{
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        backgroundColor: side === 'back' ? colors.bg.secondary : 'transparent',
                        borderRadius: radius.full,
                        borderWidth: side === 'back' ? 1 : 0,
                        borderColor: colors.border.subtle,
                    }}
                >
                    <Text style={{
                        ...typography.caption,
                        fontWeight: '600',
                        color: side === 'back' ? colors.text.primary : colors.text.muted
                    }}>Back</Text>
                </Pressable>
            </View>

            {/* Main Body View */}
            <View style={{
                height: 420,
                width: 320,
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 0,
                backgroundColor: 'transparent'
            }}>
                <Body
                    data={bodyPartData}
                    side={side}
                    scale={1.1}
                    gender="male"
                    // Map intensity 0 -> Gray, intensity 1 -> Red
                    colors={['#E5E7EB', '#F43F5E']}
                />
            </View>

            {/* Legend - Binary Gray/Red */}
            <View style={{ flexDirection: 'row', gap: spacing[4], justifyContent: 'center', marginTop: 0, paddingBottom: spacing[4] }}>
                {[
                    { label: 'Fresh', color: '#E5E7EB' },   // Gray
                    { label: 'Trained', color: '#F43F5E' }, // Red
                ].map(item => (
                    <View key={item.label} style={{ alignItems: 'center', flexDirection: 'row', gap: 6 }}>
                        <View style={{
                            width: 12, height: 12,
                            borderRadius: 3,
                            backgroundColor: item.color,
                        }} />
                        <Text style={{ ...typography.caption, color: colors.text.muted }}>
                            {item.label}
                        </Text>
                    </View>
                ))}
            </View>

        </View>
    );
}

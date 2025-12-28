export type WeightUnit = 'kg' | 'lbs';

/**
 * Converts a weight value from the source unit to KG.
 * If the unit is already KG, returns the value as is.
 * Used when saving input to the DB.
 */
export function toKg(value: number, unit: WeightUnit): number {
    if (unit === 'kg') return value;
    return value / 2.20462;
}

/**
 * Converts a weight value (stored in KG) to the target unit.
 * Used for display.
 */
export function fromKg(kgValue: number, unit: WeightUnit): number {
    if (unit === 'kg') return kgValue;
    return kgValue * 2.20462;
}

/**
 * Formats a weight value for display.
 * - If unit is 'lbs', rounds to nearest 1 decimal (or integer if clear).
 * - Appends the unit label if requested (optional).
 */
export function formatWeight(kgValue: number | null | undefined, unit: WeightUnit, includeLabel = false): string {
    if (kgValue == null || kgValue === 0) return 'BW';

    const value = fromKg(kgValue, unit);

    // Safety for 'kg' unit logic
    if (value == null) return 'BW';

    // Clean rounding: 100.00 -> 100, 100.51 -> 100.5
    const displayed = parseFloat(value.toFixed(1));

    if (!includeLabel) return displayed.toString();
    return `${displayed} ${unit}`;
}

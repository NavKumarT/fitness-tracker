/**
 * Feature Flags to safely toggle new functionality.
 * Set values to `false` to disable the feature if it causes issues.
 */
export const FEATURES = {
    /**
     * Master switch for the Home Screen Revamp.
     * Enables the Weekly Consistency Ring and Quick Stats.
     */
    HOME_V2_ENABLED: true,

    /**
     * Enables the "Weekly Consistency" bubble row.
     */
    SHOW_CONSISTENCY_RINGS: true,

    /**
     * Enables the "Quick Stats" row (Streak, Volume, etc.).
     */
    SHOW_QUICK_STATS: false,

    /**
     * Enables Cloud Sync features (Google Sign-In, Firestore Sync).
     */
    ENABLE_CLOUD_SYNC: false,
};

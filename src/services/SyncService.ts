
import { db } from '../db';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, writeBatch, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig';
import { Network } from 'expo-network'; // Optional: Check network status

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

export const SyncService = {
    /**
     * Pushes local pending changes to Firestore.
     * Call this when coming online or after meaningful edits.
     */
    async pushChanges() {
        console.log('[Sync] Starting Push...');
        const tables = [
            'workouts', 'workout_exercises', 'workout_sets',
            'training_schedules', 'training_units', 'training_unit_exercises'
        ];

        try {
            const batch = writeBatch(firestore);
            let encryptCount = 0;

            for (const table of tables) {
                // Find rows that are "Pending" (syncStatus = 1)
                const pendingRows = await db.getAllAsync<any>(
                    `SELECT * FROM ${table} WHERE syncStatus = 1`
                );

                for (const row of pendingRows) {
                    if (!row.userId || row.userId.startsWith('guest_')) continue; // Don't sync guest data

                    // Create ref: users/{userId}/{table}/{rowId}
                    const ref = doc(firestore, `users/${row.userId}/${table}/${row.id}`);

                    // Clean row data (remove sync columns before upload if desired, 
                    // or keep them but update syncStatus locally only)
                    const { syncStatus, ...dataToUpload } = row;

                    batch.set(ref, {
                        ...dataToUpload,
                        syncedAt: Timestamp.now()
                    }, { merge: true });

                    encryptCount++;
                }
            }

            if (encryptCount > 0) {
                await batch.commit();
                console.log(`[Sync] Pushed ${encryptCount} changes.`);

                // Mark as synced locally
                await db.withTransactionAsync(async () => {
                    for (const table of tables) {
                        await db.runAsync(`UPDATE ${table} SET syncStatus = 0 WHERE syncStatus = 1 AND userId NOT LIKE 'guest_%'`);
                    }
                });
            } else {
                console.log('[Sync] No pending changes.');
            }

        } catch (e) {
            console.error('[Sync] Push failed', e);
        }
    },

    /**
     * Pulls remote changes (Basic "Overwrite Local" strategy for simplicity).
     * For production, you'd want "Last Modified Wins" merging.
     */
    async pullChanges(userId: string) {
        // Implementation simplified for "Backup/Restore" use case
        console.log('[Sync] Pull not fully implemented yet - focusing on Backup first.');
    },

    async mergeAccount(localId: string, cloudId: string) {
        const tables = [
            'workouts', 'workout_exercises', 'workout_sets',
            'training_schedules', 'training_units', 'training_unit_exercises'
        ];

        try {
            await db.withTransactionAsync(async () => {
                for (const table of tables) {
                    await db.runAsync(
                        `UPDATE ${table} SET userId = ? WHERE userId = ?`,
                        [cloudId, localId]
                    );
                }
            });
            console.log(`Merged data from ${localId} to ${cloudId}`);
        } catch (e) {
            console.error('Merge failed', e);
            throw e;
        }
    }
};

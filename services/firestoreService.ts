import { db } from './firebaseService';
import type { PomodoroSession, CustomReminder, AdminStats } from '../types';

export const addPomodoroSession = async (userId: string, duration: number) => {
    if (!userId) {
        throw new Error("User is not authenticated.");
    }

    const session: PomodoroSession = {
        userId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        duration,
        completedAt: Date.now(),
    };

    try {
        const docRef = await db().collection('users').doc(userId).collection('pomodoroSessions').add(session);
        return docRef.id;
    } catch (error) {
        console.error("Error adding Pomodoro session to Firestore: ", error);
        throw new Error("Could not save your session. Please try again.");
    }
};

export const getReminders = async (userId: string): Promise<CustomReminder[]> => {
    if (!userId) {
        throw new Error("User is not authenticated.");
    }
    const snapshot = await db().collection('users').doc(userId).collection('reminders').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as CustomReminder));
};

export const addReminder = async (userId: string, reminder: Omit<CustomReminder, 'id'>) => {
     if (!userId) {
        throw new Error("User is not authenticated.");
    }
    const docRef = await db().collection('users').doc(userId).collection('reminders').add(reminder);
    return docRef.id;
};


export const deleteReminder = async (userId: string, reminderId: string) => {
    if (!userId) {
        throw new Error("User is not authenticated.");
    }
    await db().collection('users').doc(userId).collection('reminders').doc(reminderId).delete();
};

export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        // Note: These queries require composite indexes in Firestore.
        // The console will provide a link to create them the first time this runs.
        const pomodoroSnapshot = await db().collectionGroup('pomodoroSessions').get();
        const reminderSnapshot = await db().collectionGroup('reminders').get();

        return {
            totalPomodoros: pomodoroSnapshot.size,
            totalReminders: reminderSnapshot.size,
        };
    } catch (error) {
        console.error("Error fetching admin stats: ", error);
        throw new Error("Could not fetch platform-wide statistics. You may need to create Firestore indexes.");
    }
};
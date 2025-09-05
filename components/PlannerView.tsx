import React from 'react';
// Fix: Replaced direct import from 'firebase/auth' with the centralized User type from '../types'.
import type { ScheduleItem, StudyGoal, User } from '../types';
import { ScheduleView } from './ScheduleView';
import { CustomReminders } from './CustomReminders';

interface PlannerViewProps {
    schedule: ScheduleItem[];
    goal: StudyGoal;
    user: User;
    onScheduleUpdate: (newSchedule: ScheduleItem[]) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ schedule, goal, user, onScheduleUpdate }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 h-full">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Weekly Planner</h1>
                <ScheduleView schedule={schedule} goal={goal} onScheduleUpdate={onScheduleUpdate} />
            </div>
            <div className="h-full">
                 <CustomReminders userId={user.uid} />
            </div>
        </div>
    );
};
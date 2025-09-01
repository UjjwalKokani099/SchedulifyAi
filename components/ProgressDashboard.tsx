import React, { useMemo } from 'react';
import type { ScheduleItem } from '../types';
import { TrendingUpIcon, CheckCircleIcon } from './icons';

const SubjectProgress: React.FC<{ subject: string; items: ScheduleItem[] }> = ({ subject, items }) => {
    const total = items.length;
    const completed = items.filter(item => item.status === 'Completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-gray-900">{subject}</h4>
                <span className="text-sm font-medium text-gray-700">{completed} / {total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-gray-800 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
             <p className="text-right text-xs text-gray-600 mt-1">{percentage}% complete</p>
        </div>
    );
};

export const ProgressDashboard: React.FC<{ schedule: ScheduleItem[] }> = ({ schedule }) => {

    const overallProgress = useMemo(() => {
        if (schedule.length === 0) return 0;
        const completedCount = schedule.filter(item => item.status === 'Completed').length;
        return Math.round((completedCount / schedule.length) * 100);
    }, [schedule]);

    const progressBySubject = useMemo(() => {
        const subjects: { [key: string]: ScheduleItem[] } = {};
        schedule.forEach(item => {
            if (!subjects[item.subject]) {
                subjects[item.subject] = [];
            }
            subjects[item.subject].push(item);
        });
        return subjects;
    }, [schedule]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-gray-100 p-3 rounded-full">
                    <TrendingUpIcon className="w-8 h-8 text-gray-800" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Your Progress</h2>
                    <p className="text-gray-700">Keep up the great work! Here's how you're doing.</p>
                </div>
            </div>
            
            <div className="text-center mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Overall Completion</h3>
                <div className="relative inline-grid place-items-center">
                    <svg className="w-40 h-40" viewBox="0 0 160 160">
                        <circle className="text-gray-200" strokeWidth="12" stroke="currentColor" fill="transparent" r="58" cx="80" cy="80" />
                        <circle 
                            className="text-gray-800" 
                            strokeWidth="12" 
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 - (overallProgress / 100) * 364.4}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="58" 
                            cx="80" 
                            cy="80"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                         />
                    </svg>
                    <span className="col-start-1 row-start-1 text-4xl font-extrabold text-gray-900">{overallProgress}%</span>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress by Subject</h3>
                {Object.keys(progressBySubject).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(progressBySubject).map(([subject, items]) => (
                            <SubjectProgress key={subject} subject={subject} items={items} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Your schedule is empty. No progress to show yet!</p>
                )}
            </div>
        </div>
    );
};
import React, { useState, useMemo } from 'react';
import type { ScheduleItem, StudyGoal } from '../types';
import { StarIcon } from './icons';
import { TopicDetailModal } from './TopicDetailModal';

const activityStyles: { [key in ScheduleItem['activity']]: { badge: string; baseBg: string; baseBorder: string; } } = {
    'Study': { badge: 'bg-blue-100 text-blue-800', baseBg: 'bg-blue-50', baseBorder: 'border-blue-300' },
    'Revise': { badge: 'bg-purple-100 text-purple-800', baseBg: 'bg-purple-50', baseBorder: 'border-purple-300' },
    'Practice': { badge: 'bg-yellow-100 text-yellow-800', baseBg: 'bg-yellow-50', baseBorder: 'border-yellow-300' },
    'Mock Test': { badge: 'bg-red-100 text-red-800', baseBg: 'bg-red-50', baseBorder: 'border-red-300' },
    'Daily Quiz': { badge: 'bg-teal-100 text-teal-800', baseBg: 'bg-teal-50', baseBorder: 'border-teal-300' },
};

const statusStyles: { [key in ScheduleItem['status']]: { cardBg: string; cardBorder: string; textClass: string; } } = {
    'Not Started': { cardBg: 'bg-white dark:bg-gray-800', cardBorder: 'border-gray-200 dark:border-gray-700', textClass: 'text-gray-900 dark:text-gray-100' },
    'In Progress': { cardBg: 'bg-amber-50 dark:bg-amber-900/40', cardBorder: 'border-amber-300 dark:border-amber-700', textClass: 'text-gray-900 dark:text-gray-100' },
    'Completed': { cardBg: 'bg-green-50 dark:bg-green-900/40', cardBorder: 'border-green-400 dark:border-green-700', textClass: 'line-through text-gray-500 dark:text-gray-400' },
};


const ActivityBadge = ({ activity }: { activity: ScheduleItem['activity'] }) => {
    const style = activityStyles[activity] || { badge: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.badge}`}>{activity}</span>;
}

const ScheduleCard = ({ item, onStatusChange, onToggleImportant, onOpenHub, isClass10 }: { 
    item: ScheduleItem;
    onStatusChange: (newStatus: ScheduleItem['status']) => void;
    onToggleImportant: () => void;
    onOpenHub: () => void;
    isClass10: boolean;
}) => {
    const baseStyle = activityStyles[item.activity] || { baseBg: 'bg-white', baseBorder: 'border-gray-200' };
    const statusStyle = statusStyles[item.status];

    const cardClasses = item.important && item.status !== 'Completed'
        ? `bg-amber-100 border-amber-400 dark:bg-amber-900/60 dark:border-amber-600`
        : `${statusStyle.cardBg} ${statusStyle.cardBorder}`;
    
    return (
        <div
            className={`p-3 rounded-lg h-full flex flex-col justify-between transition-all duration-200 ease-in-out border-l-4 shadow-sm hover:shadow-lg hover:scale-[1.03] hover:z-20 relative ${cardClasses}`}
        >
            <div>
                <div className="flex items-start justify-between">
                    <p className={`font-bold text-sm leading-tight ${statusStyle.textClass}`}>
                        {item.topic}
                    </p>
                    <button
                        onClick={onToggleImportant}
                        className="text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 flex-shrink-0 ml-2 p-1 -mt-1 -mr-1"
                        aria-label={item.important ? 'Remove importance' : 'Mark as important'}
                    >
                        <StarIcon className={item.important ? 'w-5 h-5 text-amber-500 dark:text-amber-400' : 'w-5 h-5'} filled={item.important} />
                    </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.subject}</p>
            </div>
             <div className="mt-3 flex items-center justify-between">
                <ActivityBadge activity={item.activity} />
                 <div className="flex items-center gap-1">
                    {isClass10 && ['Study', 'Revise', 'Practice'].includes(item.activity) && (
                        <button
                            onClick={onOpenHub}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-100 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                            title="Open Study Hub"
                        >
                           Hub
                        </button>
                    )}
                    <select
                        value={item.status}
                        onChange={(e) => onStatusChange(e.target.value as ScheduleItem['status'])}
                        className="text-xs rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        aria-label="Change status"
                    >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                 </div>
            </div>
        </div>
    )
}

const parseTime = (timeStr: string): number => {
    const time = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
    if (!time) return 0;
    let [ , hoursStr, minutesStr, ampm ] = time;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);

    if (ampm.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    }
    if (ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, goal, onScheduleUpdate }) => {
  const [selectedTopic, setSelectedTopic] = useState<ScheduleItem | null>(null);

  const handleStatusChange = (itemToUpdate: ScheduleItem, newStatus: ScheduleItem['status']) => {
    const newSchedule = schedule.map(item => 
        item === itemToUpdate ? { ...item, status: newStatus } : item
    );
    onScheduleUpdate(newSchedule);
  };

  const toggleImportant = (itemToToggle: ScheduleItem) => {
    const newSchedule = schedule.map(item => 
        item === itemToToggle ? { ...item, important: !item.important } : item
    );
    onScheduleUpdate(newSchedule);
  }
  
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const isClass10 = goal.className === 'Class 10 (Boards)';

  const { timeSlots, scheduleGrid } = useMemo(() => {
    const uniqueTimeSlots = [...new Set(schedule.map(item => item.timeSlot))];
    const sortedTimeSlots = uniqueTimeSlots.sort((a, b) => {
        const startTimeA = a.split('-')[0].trim();
        const startTimeB = b.split('-')[0].trim();
        return parseTime(startTimeA) - parseTime(startTimeB);
    });

    const grid: { [time: string]: { [day: string]: ScheduleItem | null } } = {};
    sortedTimeSlots.forEach(time => {
        grid[time] = {};
        daysOfWeek.forEach(day => {
            grid[time][day] = schedule.find(item => item.day === day && item.timeSlot === time) || null;
        });
    });
    
    return { timeSlots: sortedTimeSlots, scheduleGrid: grid };
  }, [schedule]);

  return (
    <>
    <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex-shrink-0">Your Weekly Timetable</h2>
      <div className="flex-grow overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] min-w-[1200px]">
            {/* Header Row */}
            <div className="sticky top-0 left-0 bg-gray-50 dark:bg-gray-900 z-20"></div> {/* Corner */}
            {daysOfWeek.map(day => (
                 <div key={day} className="text-center font-bold text-gray-600 dark:text-gray-300 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 p-3 border-b-2 border-gray-200 dark:border-gray-700">
                    {day}
                </div>
            ))}

            {/* Timetable Rows */}
            {timeSlots.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                    <div className="text-right pr-4 py-3 font-bold text-sm text-gray-500 dark:text-gray-400 border-r-2 border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10">
                        {timeSlot.replace(/\s*-\s*/, '-').replace(/ /g, '\u00A0')}
                    </div>
                    {daysOfWeek.map(day => (
                        <div key={`${day}-${timeSlot}`} className="border-b border-r border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800/50 min-h-[140px]">
                            {scheduleGrid[timeSlot][day] ? (
                                <ScheduleCard 
                                    item={scheduleGrid[timeSlot][day]!}
                                    onStatusChange={(newStatus) => handleStatusChange(scheduleGrid[timeSlot][day]!, newStatus)}
                                    onToggleImportant={() => toggleImportant(scheduleGrid[timeSlot][day]!)}
                                    onOpenHub={() => setSelectedTopic(scheduleGrid[timeSlot][day]!)}
                                    isClass10={isClass10}
                                />
                            ) : null}
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
      </div>
    </div>
    {selectedTopic && (
        <TopicDetailModal 
            item={selectedTopic}
            onClose={() => setSelectedTopic(null)}
        />
    )}
    </>
  );
};

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  goal: StudyGoal;
  onScheduleUpdate: (newSchedule: ScheduleItem[]) => void;
}
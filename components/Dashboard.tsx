import React, { useState } from 'react';
import { PlannerView } from './PlannerView';
import { ProgressDashboard } from './ProgressDashboard';
import { TutorView } from './TutorView';
import { BreakActivities } from './BreakActivities';
import { StudyWork } from './StudyWork';
import { PomodoroTimer } from './PomodoroTimer';
import { SchedulifyLogoIcon, SignOutIcon, UserIcon, CalendarIcon, TrendingUpIcon, StopwatchIcon, SparklesIcon, JoystickIcon, UploadCloudIcon, UserCogIcon } from './icons';
import { handleSignOut } from '../services/firebaseService';
// Fix: Replaced direct import from 'firebase/auth' with the centralized User type from '../types'.
import type { StudyGoal, ScheduleItem, User } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { ProfileEditor } from './ProfileEditor';

// Helper to check if a URL is an emoji data URL and extract the emoji
const dataUrlToEmoji = (url: string | null | undefined): string | null => {
    if (!url || !url.startsWith('data:image/svg+xml')) return null;
    try {
        const decoded = decodeURIComponent(url.split(',')[1]);
        const match = decoded.match(/<text.*>(.*)<\/text>/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
};

const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
    const emoji = dataUrlToEmoji(user.photoURL);
    if (emoji) {
        return <span className="text-2xl w-full h-full flex items-center justify-center">{emoji}</span>;
    }
    if (user.photoURL) {
        return <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />;
    }
    return <UserIcon className="w-6 h-6" />;
};

interface DashboardProps {
  user: User;
  onSignOut: () => void;
  goal: StudyGoal;
  schedule: ScheduleItem[];
  onScheduleUpdate: (newSchedule: ScheduleItem[]) => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

type TabName = 'Planner' | 'Progress' | 'Focus Mode' | 'AI Tutor' | 'Break Time' | 'My Work';

const TABS: { name: TabName, icon: React.ComponentType<{className?: string}> }[] = [
    { name: 'Planner', icon: CalendarIcon },
    { name: 'Progress', icon: TrendingUpIcon },
    { name: 'Focus Mode', icon: StopwatchIcon },
    { name: 'AI Tutor', icon: SparklesIcon },
    { name: 'Break Time', icon: JoystickIcon },
    { name: 'My Work', icon: UploadCloudIcon },
]

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut, goal, schedule, onScheduleUpdate, onUserUpdate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('Planner');

  const performSignOut = () => {
      onSignOut();
      handleSignOut();
  }

  const renderContent = () => {
    switch (activeTab) {
        case 'Planner':
            return <PlannerView schedule={schedule} goal={goal} user={user} onScheduleUpdate={onScheduleUpdate} />;
        case 'Progress':
            return <ProgressDashboard schedule={schedule} />;
        case 'Focus Mode':
            return <div className="max-w-md mx-auto"><PomodoroTimer userId={user.uid} /></div>;
        case 'AI Tutor':
            return <TutorView />;
        case 'Break Time':
            return <BreakActivities />;
        case 'My Work':
            return <StudyWork />;
        default:
            return null;
    }
  }

  const TabButton: React.FC<{tab: typeof TABS[0]}> = ({ tab }) => {
    const isActive = activeTab === tab.name;
    const Icon = tab.icon;
    return (
        <button
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
        >
            <Icon className="w-5 h-5" />
            {tab.name}
        </button>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center p-3">
          <div className="flex items-center gap-3">
             <SchedulifyLogoIcon className="h-10 w-10" />
            <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Schedulify AI</h1>
                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400">
                    Goal: {goal.exam}
                </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1 bg-gray-50 border p-1 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                {TABS.map(tab => <TabButton key={tab.name} tab={tab} />)}
            </div>

            <ThemeToggle />

            <div className="relative">
              <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                  <UserAvatar user={user} />
              </button>
              {isProfileOpen && (
                   <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-2 text-gray-800 z-50 border dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3 mb-2 p-2 border-b dark:border-gray-600">
                           <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                               <UserAvatar user={user} />
                           </div>
                          <div>
                              <p className="font-bold truncate">{user.displayName || "User"}</p>
                              <p className="text-xs text-gray-600 truncate dark:text-gray-400">{user.email}</p>
                          </div>
                      </div>
                      <button
                        onClick={() => { setIsProfileEditorOpen(true); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300"
                      >
                          <UserCogIcon className="w-5 h-5" />
                          Edit Profile
                      </button>
                      <button 
                          onClick={performSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-red-600 dark:hover:bg-gray-700 dark:text-red-400"
                      >
                          <SignOutIcon className="w-5 h-5"/>
                          Sign Out
                      </button>
                   </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Tabs */}
        <div className="md:hidden p-2 border-t dark:border-gray-700 overflow-x-auto">
             <div className="flex items-center gap-2">
                {TABS.map(tab => <TabButton key={tab.name} tab={tab} />)}
            </div>
        </div>
      </header>
      
      <main className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-81px-53px)] md:h-[calc(100vh-73px)]">
          {renderContent()}
      </main>
    </div>
    {isProfileEditorOpen && (
        <ProfileEditor 
            user={user}
            onClose={() => setIsProfileEditorOpen(false)}
            onProfileUpdate={onUserUpdate}
        />
    )}
    </>
  );
};
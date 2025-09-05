import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { onAuthStateChangedListener, initFirebase, getRedirectResult } from './services/firebaseService';
import { SplashScreen } from './components/SplashScreen';
import { GoalSetup } from './components/GoalSetup';
import { generateStudySchedule } from './services/geminiService';
// Fix: Replaced direct import from 'firebase/auth' with the centralized User type from './types'.
import type { StudyGoal, ScheduleItem, User } from './types';

type AppView = 'loading' | 'auth' | 'goalSetup' | 'generatingSchedule' | 'dashboard' | 'error';

let firebaseInitialized = false;

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('loading');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [goal, setGoal] = useState<StudyGoal | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[] | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
        if (!firebaseInitialized) {
            try {
                await initFirebase();
                firebaseInitialized = true;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown initialization error occurred.";
                setError(`Authentication service failed to load. ${errorMessage}`);
                setView('error');
                return;
            }
        }

        try {
            await getRedirectResult();
        } catch(err: any) {
            if (err.code === 'auth/operation-not-supported-in-this-environment') {
                console.warn("Google Sign-In redirect is not supported in this environment. The feature will be disabled.");
            } else {
                const errorMessage = err.message || "An unknown sign-in error occurred.";
                setError(`Failed to sign in via redirect. ${errorMessage}`);
            }
        }

        const unsubscribe = onAuthStateChangedListener((userAuth) => {
            if (userAuth) {
              setUser(userAuth);
              // For simplicity, we'll assume a new user always sets a goal.
              // A real app might save/load this from a database.
              setView('goalSetup'); 
            } else {
              setUser(null);
              setView('auth');
            }
            setError(null);
        });

        return unsubscribe;
    };

    initializeApp();
    
  }, []);
  
  const handleGoalSet = async (newGoal: StudyGoal) => {
    setGoal(newGoal);
    setView('generatingSchedule');
    setError(null);
    try {
        const generatedSchedule = await generateStudySchedule(newGoal);
        if (generatedSchedule && generatedSchedule.length > 0) {
            setSchedule(generatedSchedule);
            setView('dashboard');
        } else {
            throw new Error("The generated schedule was empty. Please try refining your goals.");
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        setView('goalSetup'); // Go back to goal setup on error
    }
  };

  const handleScheduleUpdate = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
  };

  const handleUserUpdate = (updatedData: Partial<User>) => {
    if (user) {
        setUser(currentUser => currentUser ? { ...currentUser, ...updatedData } : null);
    }
  };


  const handleSignOutAndReset = () => {
    setGoal(null);
    setSchedule(null);
    // onAuthStateChangedListener will handle setting the view to 'auth'.
    console.log("User signed out and app state reset.");
  };

  const handleTryAgain = () => {
    setError(null);
    window.location.reload(); 
  }

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <SplashScreen />;
      case 'auth':
        return <Auth />;
      // Fix: Combined 'generatingSchedule' and 'goalSetup' cases to correctly handle the loading state on the GoalSetup component itself, resolving the type error.
      case 'generatingSchedule':
      case 'goalSetup':
        return <GoalSetup onGoalSet={handleGoalSet} isLoading={view === 'generatingSchedule'} error={error} />;
      case 'dashboard':
        if (user && goal && schedule) {
          return <Dashboard 
                    user={user} 
                    onSignOut={handleSignOutAndReset} 
                    goal={goal} 
                    schedule={schedule}
                    onScheduleUpdate={handleScheduleUpdate}
                    onUserUpdate={handleUserUpdate}
                 />;
        }
        // If state is inconsistent, reset
        setView('auth');
        return null;
      case 'error':
        return (
            <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center text-center p-4">
                 <h2 className="text-2xl font-semibold text-red-800">Oops! Something went wrong.</h2>
                 <p className="text-red-600 mt-2 max-w-md">{error}</p>
                 <button 
                    onClick={handleTryAgain}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                 >
                    Try Again
                 </button>
            </div>
        );
      default:
        return <SplashScreen />;
    }
  };

  return <div className="App">{renderContent()}</div>;
};

export default App;
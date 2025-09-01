import React, { useState, useEffect, useCallback } from 'react';
import { syncScheduleToCalendar, initGapiClient, handleAuthClick } from '../services/googleCalendarService';
import type { ScheduleItem, StudyGoal } from '../types';
import { CalendarIcon, LoaderIcon } from './icons';
import { config } from './config';

interface GoogleCalendarSyncProps {
  schedule: ScheduleItem[];
  goal: StudyGoal;
}

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({ schedule, goal }) => {
  const [gapiReady, setGapiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfigMissing, setIsConfigMissing] = useState(false);


  const updateSigninStatus = useCallback((signedIn: boolean) => {
    setIsSignedIn(signedIn);
  }, []);

  useEffect(() => {
    // Pre-check configuration to avoid unnecessary GAPI calls and console errors.
    const googleConfig = config.google;
    if (!googleConfig.clientId || googleConfig.clientId.includes('YOUR_')) {
        setIsConfigMissing(true);
        return; // Early exit, do not initialize GAPI.
    }

    const initialize = async () => {
      try {
        await initGapiClient(updateSigninStatus);
        setGapiReady(true);
      } catch (e: any) {
        // This catch block now only handles unexpected GAPI initialization errors.
        setError("Could not connect to Google Calendar. Please try refreshing the page.");
        console.error("GAPI Init Error:", e);
      }
    };
    initialize();
  }, [updateSigninStatus]);

  const onSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await syncScheduleToCalendar(schedule, goal);
      setSuccess(`${result.length} events synced successfully!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred during sync.";
      setError(`Sync failed: ${errorMessage}`);
      console.error("Sync Error:", e);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderButtonContent = () => {
    if (isConfigMissing) {
      return "Configuration Missing";
    }
    if (!gapiReady) {
      return <>
        <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
        Loading Calendar...
      </>;
    }
    if (!isSignedIn) {
      return "Sign in to Sync";
    }
    if (isSyncing) {
       return <>
        <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
        Syncing...
      </>;
    }
    return "Sync to Calendar";
  };

  const buttonAction = () => {
    if (isConfigMissing || !gapiReady) return;
    if (!isSignedIn) {
        handleAuthClick();
    } else {
        onSync();
    }
  }
  
  const getButtonTitle = () => {
    if (isConfigMissing) {
        return "Google Client ID is missing. Please update config.ts";
    }
    return "Sync your schedule to Google Calendar";
  }

  return (
    <div>
        <button
            onClick={buttonAction}
            disabled={isConfigMissing || !gapiReady || isSyncing}
            title={getButtonTitle()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <CalendarIcon className="w-5 h-5" />
            {renderButtonContent()}
        </button>
        {isConfigMissing && (
            <p className="text-xs text-orange-600 mt-1 max-w-[200px]">
                Calendar sync is disabled. Please add your Google Client ID to <code>config.ts</code>.
            </p>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {success && <p className="text-xs text-green-500 mt-1">{success}</p>}
    </div>
  );
};
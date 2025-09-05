import React, { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon } from './icons';
import { addPomodoroSession } from '../services/firestoreService';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODE_SETTINGS = {
  pomodoro: { duration: 25 * 60, title: 'Time to focus!', themeColor: 'text-red-600', buttonBg: 'bg-red-500 hover:bg-red-600' },
  shortBreak: { duration: 5 * 60, title: 'Time for a break!', themeColor: 'text-teal-600', buttonBg: 'bg-teal-500 hover:bg-teal-600' },
  longBreak: { duration: 15 * 60, title: 'Time for a long break!', themeColor: 'text-blue-600', buttonBg: 'bg-blue-500 hover:bg-blue-600' },
};

const playAlarm = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  } catch (e) {
    console.error("Could not play alarm sound.", e);
  }
};

export const PomodoroTimer: React.FC<{ userId: string }> = ({ userId }) => {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODE_SETTINGS.pomodoro.duration);
  const [isActive, setIsActive] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const switchMode = useCallback((newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODE_SETTINGS[newMode].duration);
  }, []);

  useEffect(() => {
    // Fix: Use `window.setInterval` to ensure the return type is `number`, resolving
    // the conflict with `NodeJS.Timeout` in browser-based environments.
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playAlarm();
      if (mode === 'pomodoro') {
        const newCount = pomodoroCount + 1;
        setPomodoroCount(newCount);
        addPomodoroSession(userId, MODE_SETTINGS.pomodoro.duration / 60)
          .catch(err => console.error("Failed to save session:", err));
        
        if (newCount % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('pomodoro');
      }
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, pomodoroCount, userId, switchMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const ModeButton = ({ buttonMode, text }: { buttonMode: Mode, text: string }) => (
      <button 
        onClick={() => switchMode(buttonMode)}
        className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${mode === buttonMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
      >
        {text}
      </button>
  )
  
  const currentTheme = MODE_SETTINGS[mode];

  return (
    <div className={`p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col items-center bg-white dark:bg-gray-800/50`}>
      <div className="bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg flex items-center gap-2 mb-8">
        <ModeButton buttonMode="pomodoro" text="Pomodoro" />
        <ModeButton buttonMode="shortBreak" text="Short Break" />
        <ModeButton buttonMode="longBreak" text="Long Break" />
      </div>

      <div className={`text-8xl font-extrabold mb-4 tracking-tighter ${currentTheme.themeColor}`}>
        {formatTime(timeLeft)}
      </div>

      <p className="text-lg font-medium mb-8 text-gray-600 dark:text-gray-400">{currentTheme.title}</p>
      
      <button
        onClick={toggleTimer}
        className={`w-24 h-24 rounded-full text-white flex items-center justify-center text-2xl font-bold uppercase shadow-2xl transform hover:scale-105 transition-transform ${currentTheme.buttonBg}`}
        aria-label={isActive ? 'Pause timer' : 'Start timer'}
      >
        {isActive ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10 pl-2"/>}
      </button>

      <div className="mt-8 text-lg text-gray-700 dark:text-gray-300">
        Completed today: <span className="font-bold">{pomodoroCount}</span>
      </div>
    </div>
  );
};
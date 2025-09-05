// Fix: Declare firebase globally for type definitions used in this file.
declare const firebase: any;

// Fix: Define the User type from the Firebase v8 SDK to resolve import errors.
export type User = firebase.auth.User;

// Fix: Added StudyGoal interface to define the structure of a user's study objectives.
export interface StudyGoal {
  exam: string;
  className: string;
  subjects: string[];
  targetDate: string;
  customSyllabus: string;
  coachingTimings: string;
}

// Fix: Added ScheduleItem interface to define the structure of a single item in the weekly study schedule.
export interface ScheduleItem {
  day: string;
  timeSlot: string;
  subject: string;
  topic: string;
  activity: 'Study' | 'Revise' | 'Practice' | 'Mock Test' | 'Daily Quiz';
  status: 'Not Started' | 'In Progress' | 'Completed';
  important: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  sources?: GroundingSource[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course';
}

export interface PerformanceData {
  subject: string;
  score: number;
  weakAreas: string[];
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

export interface PomodoroSession {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  completedAt: number; // timestamp
}

export interface CustomReminder {
    id: string;
    userId: string;
    message: string;
    time: string; // "HH:mm" format
}

export interface VideoResource {
  title: string;
  url: string;
}

export interface NoteResource {
  title: string;
  url: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface TopicResourceSet {
  videos: VideoResource[];
  notes: NoteResource[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface QuizAttempt {
  [questionIndex: number]: string; // selectedOption
}

export interface AdminStats {
  totalPomodoros: number;
  totalReminders: number;
}

export type BreakActivityType = 'Mindfulness' | 'Puzzle' | 'Creative' | 'Physical';

export interface BaseBreakActivity {
    type: BreakActivityType;
    title: string;
}

export interface MindfulnessActivity extends BaseBreakActivity {
    type: 'Mindfulness';
    steps: string[];
}

export interface PuzzleActivity extends BaseBreakActivity {
    type: 'Puzzle';
    jumbledWord: string;
    hint: string;
    answer: string;
}

export interface SuggestionActivity extends BaseBreakActivity {
    type: 'Creative' | 'Physical';
    description: string;
}

export type BreakActivitySuggestion = MindfulnessActivity | PuzzleActivity | SuggestionActivity;
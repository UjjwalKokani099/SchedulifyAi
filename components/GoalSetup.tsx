import React, { useState } from 'react';
import type { StudyGoal } from '../types';
import { BrainCircuitIcon, LoaderIcon } from './icons';
import { SyllabusSelector } from './SyllabusSelector';

interface GoalSetupProps {
  onGoalSet: (goal: StudyGoal) => void;
  isLoading: boolean;
  error?: string | null;
}

export const GoalSetup: React.FC<GoalSetupProps> = ({ onGoalSet, isLoading, error }) => {
  const [exam, setExam] = useState('');
  const [className, setClassName] = useState('Class 10 (Boards)');
  const [subjects, setSubjects] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [customSyllabus, setCustomSyllabus] = useState('');
  const [coachingTimings, setCoachingTimings] = useState('');
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !subjects || !targetDate || !className) {
      alert('Please fill in all required fields.');
      return;
    }
    onGoalSet({
      exam,
      className,
      subjects: subjects.split(',').map(s => s.trim()).filter(s => s),
      targetDate,
      customSyllabus,
      coachingTimings,
    });
  };

  const handleSyllabusSave = (selectedTopics: string[]) => {
    setCustomSyllabus(selectedTopics.join(', '));
    setIsSyllabusModalOpen(false);
  }

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-xl w-full mx-auto">
          <div className="text-center mb-8">
              <BrainCircuitIcon className="mx-auto h-12 w-12 text-indigo-600" />
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mt-4">Welcome to Schedulify AI</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your personal AI study planner and tutor for Class 10.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Error Generating Plan</p>
                <p>{error}</p>
            </div>}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Tell us about your goal</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class/Level
                  </label>
                  <input
                    type="text"
                    id="className"
                    value={className}
                    readOnly
                    disabled
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="exam" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What's your primary goal?
                  </label>
                  <input
                    type="text"
                    id="exam"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    placeholder="e.g., CBSE Boards, Final Exams"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
              </div>
               <div>
                <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What are your subjects? (comma-separated)
                </label>
                <input
                  type="text"
                  id="subjects"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g., Science, Maths, Social Science"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
               <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What's your target date?
                </label>
                <input
                  type="date"
                  id="targetDate"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white dark:[color-scheme:dark]"
                  required
                />
              </div>
              <div>
                  <label htmlFor="coachingTimings" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coaching/Fixed Timings (Optional)
                  </label>
                  <textarea
                      id="coachingTimings"
                      value={coachingTimings}
                      onChange={(e) => setCoachingTimings(e.target.value)}
                      rows={3}
                      placeholder="List times you are busy, e.g., Mon, Wed, Fri: 4 PM - 6 PM; Sat: 9 AM - 1 PM"
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Syllabus (Optional, Recommended)
                  </label>
                   <button
                    type="button"
                    onClick={() => setIsSyllabusModalOpen(true)}
                    className="mt-1 w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {customSyllabus ? `${customSyllabus.split(',').length} topics selected` : 'Select Syllabus Topics...'}
                  </button>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Generating your plan...
                    </>
                  ) : (
                    'Create My Study Plan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isSyllabusModalOpen && (
        <SyllabusSelector
          className={className}
          onClose={() => setIsSyllabusModalOpen(false)}
          onSave={handleSyllabusSave}
        />
      )}
    </>
  );
};
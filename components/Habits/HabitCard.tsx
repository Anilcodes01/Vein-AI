// src/components/Habits/HabitCard.tsx

import React, { useState, useMemo } from 'react';
import { Habit, HabitCompletion } from '@/types';
import HabitCalendar from './HabitCalender';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flame } from 'lucide-react';
// Remove local streak calculation import if you have one

function formatFrequency(days: string[]): string {
  // ... (this function is fine)
  if (days.length === 7) return 'Daily';
  if (days.length === 0) return 'No days set';
  return days.map(day => day.slice(0, 3)).join(', ');
}

export default function HabitCard({ habit, onUpdate }: { habit: Habit, onUpdate: (habitId: string, newCompletions: HabitCompletion[]) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCompletionChange = (newCompletions: HabitCompletion[]) => {
    onUpdate(habit.id, newCompletions);
  };

  // --- REFACTOR useMemo ---
  // We no longer need to calculate the streak here, as it comes from the `habit` prop.
  // We only calculate month-specific data.
  const { completionRate, completedThisMonth } = useMemo<{
    completionRate: number;
    completedThisMonth: number;
  }>(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const completedCount = habit.completions.filter(c => {
      const completionDate = new Date(c.date);
      return completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear;
    }).length;

    const rate = daysInMonth > 0 ? Math.round((completedCount / daysInMonth) * 100) : 0;

    return { completionRate: rate, completedThisMonth: completedCount };
  }, [habit.completions]);
  
  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 flex flex-col gap-4">
        {/* --- Top Section: Add Streak Indicator --- */}
        <div className="flex items-start gap-4">
          <div className="text-4xl">{habit.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{habit.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFrequency(habit.frequencyDays)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* --- Streak Indicator --- */}
            {habit.currentStreak > 0 && (
              <div className="flex items-center gap-1 text-orange-500 font-bold" title={`Current Streak: ${habit.currentStreak} days`}>
                <span>{habit.currentStreak}</span>
                <Flame size={18} />
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isExpanded ? 'Collapse calendar' : 'Expand calendar'}
            >
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                <ChevronDown size={20} />
              </motion.div>
            </button>
          </div>
        </div>
        
        {/* --- Middle & Expanded Sections are fine, no changes needed --- */}
        <div>
          {/* ... (progress bar) ... */}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <HabitCalendar
              habitId={habit.id}
              initialCompletions={habit.completions}
              onCompletionChange={handleCompletionChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
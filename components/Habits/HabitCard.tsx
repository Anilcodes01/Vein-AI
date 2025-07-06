import React, { useState, useMemo } from 'react';
import { Habit, HabitCompletion } from '@/types';
import HabitCalendar from './HabitCalender';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flame } from 'lucide-react';
import { calculateStreak } from '@/lib/streak';

function formatFrequency(days: string[]): string {
  if (days.length === 7) return 'Daily';
  if (days.length === 0) return 'No days set';
  return days.map(day => day.slice(0, 3)).join(', ');
}

export default function HabitCard({ habit, onUpdate }: { habit: Habit, onUpdate: (habitId: string, newCompletions: HabitCompletion[]) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCompletionChange = (newCompletions: HabitCompletion[]) => {
    onUpdate(habit.id, newCompletions);
  };

  const { currentStreak, completionRate, completedThisMonth } = useMemo<{
    currentStreak: number;
    completionRate: number;
    completedThisMonth: number;
  }>(() => {
    const streak = calculateStreak(habit.completions);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const completedCount = habit.completions.filter(c => {
      const completionDate = new Date(c.date);
      return completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear;
    }).length;

    const rate = daysInMonth > 0 ? Math.round((completedCount / daysInMonth) * 100) : 0;

    return { currentStreak: streak, completionRate: rate, completedThisMonth: completedCount };
  }, [habit.completions]);
  
  return (
    // --- FIX: Add 'relative' to make this the positioning context for the absolute calendar ---
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 flex flex-col gap-4">
        {/* --- Top Section: Info & Streak --- */}
        <div className="flex items-start gap-4">
          <div className="text-4xl">{habit.icon}</div>
          <div className="flex-1 min-w-0"> {/* Add min-w-0 for text truncation if needed */}
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate">{habit.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFrequency(habit.frequencyDays)}
            </p>
          </div>
          <div className="flex items-center gap-2">
          
            {/* Expand Button */}
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
        
        {/* --- Middle Section: Monthly Progress --- */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              This Month
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {completedThisMonth} days
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- FIX: Expandable Calendar Section with Absolute Positioning --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            // Position absolutely below the card, spanning its full width
            className="absolute top-full left-0 right-0 mt-2 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* The calendar component itself doesn't need to change */}
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
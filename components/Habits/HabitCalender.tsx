import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { HabitCompletion } from '@/types';

// The custom Calendar sub-component is fine as is.
type CalendarProps = {
  selected: Date[];
  onDayClick: (day: Date) => void;
  disabled?: (day: Date) => boolean;
};

function Calendar({ selected, onDayClick, disabled }: CalendarProps) {
  // ... (This entire component is correct, no changes needed here)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentYear === today.getFullYear() ? currentMonth + 1 : 12, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const days = [];
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentYear, currentMonth, day));
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          {monthNames[currentMonth]} {currentYear}
        </h2>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square" />;
          }
          
          const isToday = isSameDay(day, today);
          const isSelected = selected.some(d => isSameDay(d, day));
          const isDisabled = disabled && day > today;
          
          return (
            <button
              key={day.getTime()}
              onClick={() => !isDisabled && onDayClick(day)}
              disabled={isDisabled}
              className={`
                aspect-square flex items-center justify-center text-sm font-medium rounded-lg
                transition-all duration-200 ease-in-out
                ${isDisabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer active:scale-95'}
                ${isSelected ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 dark:hover:bg-emerald-600' : 'text-gray-700 dark:text-gray-300'}
                ${isToday && !isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}


// --- Main HabitCalendar Component ---
type HabitCalendarProps = {
  habitId: string;
  initialCompletions: HabitCompletion[];
  onCompletionChange: (newCompletions: HabitCompletion[]) => void;
};

export default function HabitCalendar({ habitId, initialCompletions, onCompletionChange }: HabitCalendarProps) {
  const [completions, setCompletions] = useState(initialCompletions);
  const [isLoading, setIsLoading] = useState(false);
  const completedDays = completions.map(c => new Date(c.date));

  const handleDayClick = async (day: Date | undefined) => {
    if (!day || isLoading || day > new Date()) return;
    setIsLoading(true);

    const dateString = format(day, 'yyyy-MM-dd');
    const isCompleted = completedDays.some(d => isSameDay(d, day));
    
    try {
      if (isCompleted) {
        // --- FIX: Replace simulated DELETE with real fetch call ---
        const res = await fetch(`/api/habits/${habitId}/completions?date=${dateString}`, { 
          method: 'DELETE' 
        });

        if (!res.ok) {
          throw new Error('Failed to delete completion');
        }

        const newCompletions = completions.filter(c => !isSameDay(new Date(c.date), day));
        setCompletions(newCompletions);
        onCompletionChange(newCompletions);

      } else {
        // --- FIX: Replace simulated POST with real fetch call ---
        const res = await fetch(`/api/habits/${habitId}/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateString }),
        });

        if (!res.ok) {
          throw new Error('Failed to create completion');
        }
        
        const newCompletion = await res.json();
        const newCompletions = [...completions, newCompletion];
        setCompletions(newCompletions);
        onCompletionChange(newCompletions);
      }
    } catch (error) {
      console.error("Failed to update habit completion", error);
      // Optional: Add user-facing error state here
    } finally {
      setIsLoading(false);
    }
  };

  const completedCountThisMonth = completions.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const completionRate = daysInCurrentMonth > 0 ? Math.round((completedCountThisMonth / daysInCurrentMonth) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Progress this month
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {completedCountThisMonth} days
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        selected={completedDays}
        onDayClick={handleDayClick}
        disabled={day => day > new Date()}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Updating...</span>
        </div>
      )}
    </div>
  );
}
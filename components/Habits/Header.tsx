
import React from 'react';
import { Plus, Flame } from 'lucide-react';

type HabitsHeaderProps = {
  onAddHabitClick: () => void;
  onStreaksClick: () => void;
};

export default function HabitsHeader({ onAddHabitClick, onStreaksClick }: HabitsHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base mt-2 max-w-md">
            Track your habits and gain insights into your habits and consistency.
          </p>
        </div>
        <div className="flex gap-4 ml-6">
          <button
            onClick={onAddHabitClick}
            className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Habit
          </button>
          <button
            onClick={onStreaksClick}
            className="bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
          >
            <Flame size={20} className="text-orange-500"/>
            Streaks
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 px-4">
            Track your habits and gain insights into your consistency.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onAddHabitClick}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-2 w-full max-w-xs"
          >
            <Plus size={20} />
            Add New Habit
          </button>
         
        </div>
      </div>
    </div>
  );
}
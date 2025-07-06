import React from 'react';
import { Habit } from '@/types';
import HabitCard from './HabitCard';

type HabitListProps = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
};

export default function HabitList({ habits, isLoading, error }: HabitListProps) {
  if (isLoading) {
    return <div className="text-center text-gray-500 mt-8">Loading habits...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-12 p-8 border-2 border-dashed rounded-xl">
        <h3 className="text-xl font-semibold">No Habits Yet</h3>
        <p className="mt-2">Click "Add Habit" to start tracking your goals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
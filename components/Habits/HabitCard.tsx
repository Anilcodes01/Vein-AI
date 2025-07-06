import { Habit } from "@/types";
import React from "react";

function formatFrequency(days: string[]): string {
  if (days.length === 7) return "Daily";
  if (days.length === 0) return "No days set";
  return days.map(day => day.slice(0, 3)).join(', ');
}

export default function HabitCard({ habit }: { habit: Habit }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{habit.icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{habit.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatFrequency(habit.frequencyDays)}
          </p>
        </div>
      </div>
      {habit.type !== "CHECK_IN" && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-right">
          <p className="text-sm font-semibold text-[#a99667]">
            Target: {habit.target} {habit.targetUnit}
          </p>
        </div>
      )}
    </div>
  );
}
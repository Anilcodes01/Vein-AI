// src/components/Habits/HabitsComp.tsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import HabitsHeader from "./Header";
import AddNewHabit from "./AddNewHabit"; // This is your AddHabitModal
import HabitList from "./HabitList";
import StreaksModal from "./StreaksModal"; // --- Import the new component ---
import { Habit, HabitCompletion } from "@/types";

export default function HabitsComp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStreaksModalOpen, setIsStreaksModalOpen] = useState(false); // --- State for streaks modal ---
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    // No need to set isLoading here if you want a silent refresh
    // setIsLoading(true); 
    setError(null);
    try {
      const res = await fetch("/api/habits/gethabits"); // Ensure this matches your GET route
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch habits");
      }
      setHabits(data.habits);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Only set loading to false after the initial load
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleHabitUpdate = async (habitId: string, newCompletions: HabitCompletion[]) => {
    // Optimistic update
    setHabits(prevHabits => 
      prevHabits.map(habit =>
        habit.id === habitId ? { ...habit, completions: newCompletions } : habit
      )
    );
    // Fetch all habits again to get updated streak counts from the backend
    await fetchHabits();
  };

  return (
    <div className="flex w-full flex-col bg-[#fcfbf8] dark:bg-gray-900 lg:pl-64 lg:mr-8 overflow-y-auto hide-scrollbar p-4 mb-16 lg:mb-0 lg:p-6">
      <div className="lg:ml-12">
        <HabitsHeader 
          onAddHabitClick={() => setIsModalOpen(true)}
          onStreaksClick={() => setIsStreaksModalOpen(true)} // --- Pass the handler ---
        />
        <HabitList 
          habits={habits} 
          isLoading={isLoading} 
          error={error} 
          onUpdateHabit={handleHabitUpdate} 
        />
      </div>

      <AddNewHabit // This is your AddHabitModal component
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onHabitCreated={fetchHabits}
      />
      
      {/* --- Render the StreaksModal --- */}
      <StreaksModal
        isOpen={isStreaksModalOpen}
        onClose={() => setIsStreaksModalOpen(false)}
        habits={habits}
      />
    </div>
  );
}
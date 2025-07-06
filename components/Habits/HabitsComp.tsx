"use client";
import React, { useState, useEffect, useCallback } from "react";
import HabitsHeader from "./Header";
import AddNewHabit from "./AddNewHabit";
import HabitList from "./HabitList";
import { Habit } from "@/types";
import { HabitCompletion } from "@/types";

export default function HabitsComp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/habits/gethabits");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch habits");
      }
      setHabits(data.habits);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);


   const handleHabitUpdate = (habitId: string, newCompletions: HabitCompletion[]) => {
    setHabits(prevHabits => 
      prevHabits.map(habit =>
        habit.id === habitId ? { ...habit, completions: newCompletions } : habit
      )
    );
  };

  return (
    <div className="flex w-full flex-col bg-[#fcfbf8] lg:pl-64 lg:mr-8 overflow-y-auto hide-scrollbar p-4 mb-16 lg:mb-0 lg:p-6">
      <div className="lg:ml-12">
        <HabitsHeader onAddHabitClick={() => setIsModalOpen(true)} />
         <HabitList 
          habits={habits} 
          isLoading={isLoading} 
          error={error} 
          onUpdateHabit={handleHabitUpdate} 
        />
      </div>

      <AddNewHabit
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onHabitCreated={fetchHabits}
      />
    </div>
  );
}
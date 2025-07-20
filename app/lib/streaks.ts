

import { DayOfWeek, Habit, HabitCompletion } from "@prisma/client";

const dayOfWeekToNumber: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

interface HabitWithCompletions extends Habit {
  completions: Pick<HabitCompletion, 'date'>[];
}

export function calculateStreaks(habit: HabitWithCompletions): { currentStreak: number, longestStreak: number } {
  if (habit.completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completionDates = new Set(
    habit.completions.map(c => c.date.toISOString().split('T')[0])
  );

  const scheduledDays = new Set(habit.frequencyDays.map(day => dayOfWeekToNumber[day]));

  let longestStreak = 0;
  let currentRun = 0;
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); 
  
  let currentDate = new Date(habit.startDate);
  currentDate.setUTCHours(0, 0, 0, 0); 

  while (currentDate <= today) {
    const dayOfWeek = currentDate.getUTCDay();
    const dateString = currentDate.toISOString().split('T')[0];

    if (scheduledDays.has(dayOfWeek)) {
      if (completionDates.has(dateString)) {
        currentRun++;
      } else {
        longestStreak = Math.max(longestStreak, currentRun);
        currentRun = 0;
      }
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  longestStreak = Math.max(longestStreak, currentRun);

  let currentStreak = 0;
  let checkDate = new Date(); 
  checkDate.setUTCHours(0, 0, 0, 0);

  let streakIsActive = true; 

  const maxDaysToCheck = habit.completions.length + 1;

  for (let i = 0; i < maxDaysToCheck; i++) {
    const dayOfWeek = checkDate.getUTCDay();
    const dateString = checkDate.toISOString().split('T')[0];

    if (scheduledDays.has(dayOfWeek)) {
      if (completionDates.has(dateString)) {
        if (streakIsActive) {
          currentStreak++;
        }
        if (i > 0) { 
           streakIsActive = false;
        } else { 
           streakIsActive = false;
        }
      }
    }
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    if (checkDate < habit.startDate) {
        break;
    }
  }

  return { currentStreak, longestStreak };
}
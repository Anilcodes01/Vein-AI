import { format, subDays } from 'date-fns';
import { HabitCompletion } from '@/types';

/**
 * Calculates the current completion streak for a habit.
 * A streak is the number of consecutive days ending today or yesterday.
 * @param completions - An array of habit completion objects.
 * @returns The number of consecutive days in the streak.
 */
export function calculateStreak(completions: HabitCompletion[]): number {
  if (!completions || completions.length === 0) {
    return 0;
  }

  // Create a Set of completion dates in 'YYYY-MM-DD' format for fast lookups.
  const completionSet = new Set(
    completions.map(c => format(new Date(c.date), 'yyyy-MM-dd'))
  );
  
  let streak = 0;
  let today = new Date();
  
  // The streak can start from today or yesterday.
  // Find the most recent completed day to start counting from.
  let checkDate = new Date();
  const todayFormatted = format(today, 'yyyy-MM-dd');
  const yesterdayFormatted = format(subDays(today, 1), 'yyyy-MM-dd');

  if (completionSet.has(todayFormatted)) {
    // Streak includes today. Start counting from today.
    checkDate = today;
  } else if (completionSet.has(yesterdayFormatted)) {
    // Streak ended yesterday. Start counting from yesterday.
    checkDate = subDays(today, 1);
  } else {
    // No recent completion, so the streak is 0.
    return 0;
  }

  // Loop backwards from the starting day.
  while (true) {
    const formattedDate = format(checkDate, 'yyyy-MM-dd');
    if (completionSet.has(formattedDate)) {
      streak++;
      checkDate = subDays(checkDate, 1); // Move to the previous day
    } else {
      // The day was not completed, so the streak is broken.
      break;
    }
  }

  return streak;
}
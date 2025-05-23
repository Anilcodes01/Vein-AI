import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { subDays, subMonths, startOfMonth, endOfMonth, format, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, getDay, getMonth } from 'date-fns';
import { authOptions } from '@/app/lib/authOptions';

// Helper to generate all labels for a given range to ensure charts show empty periods
const generateLabelsAndInitialData = (startDate: Date, endDate: Date, groupBy: 'day' | 'month', rangeType: string) => {
    const labels: string[] = [];
    const initialData: Record<string, { totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number, totalWaterMl: number }> = {};

    if (groupBy === 'day') {
        if (rangeType === 'weekly') { // Last 7 days, specific day names
            const days = eachDayOfInterval({ start: startDate, end: endDate });
            days.forEach(day => {
                const label = format(day, 'EEE'); // Mon, Tue
                labels.push(label);
                initialData[label] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalWaterMl: 0 };
            });
        } else if (rangeType === 'monthly') { // Days of the month: 01, 02...
             const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
             daysInMonth.forEach(day => {
                const label = format(day, 'dd'); // 01, 02, ...
                labels.push(label);
                initialData[label] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalWaterMl: 0 };
            });
        }
    } else if (groupBy === 'month') { // yearly range
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        months.forEach(month => {
            const label = format(month, 'MMM'); // Jan, Feb
            labels.push(label);
            initialData[label] = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalWaterMl: 0 };
        });
    }
    return { labels, initialData };
};


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || 'weekly';

  let startDate: Date;
  let endDate: Date = new Date(); // Today
  let groupBy: 'day' | 'month';

  if (range === 'weekly') {
    startDate = subDays(new Date(), 6); // Last 7 days (inclusive of today)
    endDate = new Date(); // Today
    groupBy = 'day';
  } else if (range === 'monthly') {
    startDate = startOfMonth(new Date()); // Start of the current month
    endDate = endOfMonth(new Date());   // End of the current month (could be today if month not over)
    groupBy = 'day';
  } else if (range === 'yearly') {
    startDate = startOfYear(new Date());
    endDate = endOfYear(new Date()); // Use endOfYear for consistency if displaying full year
    groupBy = 'month';
  } else {
    return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
  }

  const dbData = await prisma.userNutritionLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const { labels: preGeneratedLabels, initialData: grouped } = generateLabelsAndInitialData(startDate, endDate, groupBy, range);


  dbData.forEach(entry => {
    let label: string;
    if (groupBy === 'day') {
        if (range === 'weekly') {
            label = format(entry.date, 'EEE');
        } else { // monthly
            label = format(entry.date, 'dd');
        }
    } else { // yearly (groupBy month)
        label = format(entry.date, 'MMM');
    }

    if (grouped[label]) { // Ensure label exists from pre-generation
        grouped[label].totalCalories += entry.totalCalories;
        grouped[label].totalProtein += entry.totalProtein;
        grouped[label].totalCarbs += entry.totalCarbs;
        grouped[label].totalFat += entry.totalFat;
        grouped[label].totalWaterMl += entry.totalWaterMl;
    }
  });

  const calories: number[] = [];
  const protein: number[] = [];
  const carbs: number[] = [];
  const fats: number[] = [];
  const water: number[] = [];

  preGeneratedLabels.forEach(label => {
    const g = grouped[label];
    calories.push(g.totalCalories);
    protein.push(g.totalProtein);
    carbs.push(g.totalCarbs);
    fats.push(g.totalFat);
    water.push(g.totalWaterMl);
  });

  const total = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr: number[]) => arr.length > 0 ? total(arr) / arr.length : 0;

  return NextResponse.json({
    range,
    unit: groupBy,
    labels: preGeneratedLabels,
    values: { calories, protein, carbs, fats, water },
    totals: {
      calories: total(calories), protein: total(protein), carbs: total(carbs), fats: total(fats), water: total(water),
    },
    averages: {
      calories: avg(calories), protein: avg(protein), carbs: avg(carbs), fats: avg(fats), water: avg(water),
    },
  });
}
'use client'
import NutritionTracker from "./NutritionTracker";
import TrackInput from "./TrackInput";
import { useState } from "react";

interface NutritionEntry {
  id: string;
  time: string;
  mealtime: string;
  description: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  waterMl: number;
}

interface TotalEntries {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalWaterMl: number;
}

export default function TrackComp() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [totals, setTotals] = useState<TotalEntries>({
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    totalWaterMl: 0
  });
  const [loading, setLoading] = useState(false);

  const handleTrackSubmit = async (data: { 
    input: string; 
    mealTime: string;
    timestamp: string;
  }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/Track/chatTrack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: data.input,
          mealtime: data.mealTime,
          timestamp: data.timestamp
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save nutrition data');
      }

      const result = await response.json();
      setEntries(prev => [...prev, result.entry]);
      setTotals(result.totalEntries);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] pl-64 min-h-screen p-6">
      <div className="flex flex-col">
        <TrackInput onSubmit={handleTrackSubmit} />

        <NutritionTracker />
      </div>

      {loading && (
        <div className="ml-24 mt-4">
          <p>Processing your nutrition data...</p>
        </div>
      )}




      <div className="mt-8 ml-24 max-w-6xl">
        {entries.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Today's Nutrition Entries</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {entries.map((entry, index) => (
                <div key={index} className="bg-white/70 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold capitalize">{entry.mealtime}</h3>
                      <p className="text-gray-700">{entry.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{entry.calories} kcal</p>
                      <div className="flex gap-2 text-xs">
                        <span>P: {entry.protein}g</span>
                        <span>F: {entry.fat}g</span>
                        <span>C: {entry.carbs}g</span>
                        {entry.waterMl > 0 && <span>Water: {entry.waterMl}ml</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4">Daily Totals</h2>
            <div className="bg-white/70 p-4 rounded-lg shadow grid grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Calories</p>
                <p className="font-bold">{totals.totalCalories} kcal</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Protein</p>
                <p className="font-bold">{totals.totalProtein}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Fat</p>
                <p className="font-bold">{totals.totalFat}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Carbs</p>
                <p className="font-bold">{totals.totalCarbs}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Water</p>
                <p className="font-bold">{totals.totalWaterMl}ml</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
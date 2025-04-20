
"use client";

import { useEffect, useState } from 'react';
import { NutritionLog, NutritionEntry } from '../../app/lib/types'; 

export default function NutritionTracker() {
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/Track/getTracks?date=${selectedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition data');
      }
      
      const data = await response.json();
      setNutritionLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, [selectedDate]);

  const getMealTimeColor = (mealtime: string) => {
    switch (mealtime) {
      case 'breakfast': return 'bg-orange-100';
      case 'lunch': return 'bg-blue-100';
      case 'dinner': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nutrition Tracker</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input input-bordered"
        />
      </div>

      {nutritionLogs.length === 0 ? (
        <div className="text-center p-8 bg-base-200 rounded-lg">
          <p className="text-gray-500">No entries found for this date</p>
        </div>
      ) : (
        <div className="space-y-6">
          {nutritionLogs.map((log) => (
            <div key={log.id} className="bg-base-100 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {new Date(log.date).toLocaleDateString()}
                </h2>
                <div className="flex gap-4">
                  <div className="badge badge-primary">
                    Total Calories: {log.totalCalories}
                  </div>
                  <div className="badge badge-secondary">
                    Protein: {log.totalProtein}g
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {log.entries.map((entry: NutritionEntry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg ${getMealTimeColor(entry.mealtime)} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          <span className="capitalize">{entry.mealtime}</span>
                          <span className="text-gray-500 ml-2">
                            @ {new Date(entry.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </h3>
                        <p className="text-gray-700 mt-1">{entry.description}</p>
                      </div>
                      <div className="text-right min-w-[160px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div>Calories: {entry.calories}</div>
                          <div>Protein: {entry.protein}g</div>
                          <div>Carbs: {entry.carbs}g</div>
                          <div>Fat: {entry.fat}g</div>
                          {entry.waterMl > 0 && (
                            <div className="col-span-2 text-blue-600">
                              Water: {entry.waterMl}ml
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Added via {entry.source.replace('_', ' ')} at{' '}
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Interfaces (InsightsData, InsightsContextType, etc.) remain the same as before
interface InsightsDataValues {
  calories: number[];
  protein: number[];
  carbs: number[];
  fats: number[];
  water: number[];
}

interface InsightsTotalsAverages {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
}

export interface InsightsData {
  range: string;
  unit: 'day' | 'month';
  labels: string[];
  values: InsightsDataValues;
  totals: InsightsTotalsAverages;
  averages: InsightsTotalsAverages;
}

interface InsightsContextType {
  data: InsightsData | null;
  loading: boolean;
  error: string | null;
  range: string; // Will store 'weekly', 'monthly', 'yearly'
  viewMode: string; // 'Nutrition', 'Overview', 'Activity'
  setRange: (rangeButtonText: string) => void; // Expects 'Week', 'Month', 'Year'
  setViewMode: (viewMode: string) => void;
  fetchInsights: () => void;
}


const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export const InsightsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Context `range` state will store API-compatible values: 'weekly', 'monthly', 'yearly'
  const [range, setRangeState] = useState<string>('weekly'); // Default to monthly (API compatible)
  const [viewMode, setViewModeState] = useState<string>('Nutrition');

  const fetchInsights = useCallback(async () => {
    if (viewMode !== 'Nutrition') {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // `range` state is already API compatible, use it directly
      const response = await fetch(`/api/insights?range=${range}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      const result: InsightsData = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range, viewMode]); // Dependencies are correct

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]); // fetchInsights is memoized, this is fine

  // This function receives button text like 'Week', 'Month', 'Year'
  // It converts it to API-compatible string ('weekly', 'monthly', 'yearly') and updates state
  const setRange = (newRangeButtonText: string) => {
    let apiCompatibleRange = 'monthly'; // Default (should match one of the cases)
    if (newRangeButtonText === 'Week') {
      apiCompatibleRange = 'weekly';
    } else if (newRangeButtonText === 'Month') {
      apiCompatibleRange = 'monthly';
    } else if (newRangeButtonText === 'Year') {
      apiCompatibleRange = 'yearly';
    }
    setRangeState(apiCompatibleRange);
  };

  const setViewMode = (newViewMode: string) => {
    setViewModeState(newViewMode);
  };

  return (
    <InsightsContext.Provider value={{ data, loading, error, range, viewMode, setRange, setViewMode, fetchInsights }}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
};
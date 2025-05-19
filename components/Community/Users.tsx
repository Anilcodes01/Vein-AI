"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle, Flame, UserCircle, Award, Users as UsersIcon } from 'lucide-react';
import { CommunityUser } from '@/lib/types';

export default function Users() {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/community/fetchUsers');

        if (!response.ok) {
          let errorMsg = `Error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (_) {
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.users)) {
          throw new Error("Invalid data format received from server.");
        }

        console.log("Users data received:", data.users); 
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getCurrentStreak = (user: any): number => {
    if (Array.isArray(user.streak) && user.streak.length > 0 && user.streak[0]?.current !== undefined) {
      return user.streak[0].current;
    }
    else if (typeof user.streak === 'object' && !Array.isArray(user.streak) && user.streak?.current !== undefined) {
      return user.streak.current;
    }
    else if (typeof user.streak === 'number') {
      return user.streak;
    }
    return 0;
  };

  const hasStreak = (user: any): boolean => {
    return Array.isArray(user.streak) ? user.streak.length > 0 : user.streak !== undefined && user.streak !== null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading community members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] p-4">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg max-w-md text-center" role="alert">
          <AlertCircle className="w-5 h-5 inline-block mr-2 mb-1" />
          <strong className="font-bold">Loading Failed!</strong>
          <span className="block sm:inline ml-1">{error}</span>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No community members found yet.</p>
        <p className="text-sm mt-1">Check back later!</p>
      </div>
    );
  }

  return (

    <div className="w-full">
      <div className="flex flex-col w-full items-center gap-3">
        {users.map((user) => {
          const currentStreak = getCurrentStreak(user);
          
          return (
            <div
              key={user.id}
              className="flex w-full max-w-sm items-center bg-white dark:bg-gray-800 rounded-2xl px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
            >
              <div className="relative w-8 h-8 flex-shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={`${user.name || user.username || 'User'}'s avatar`}
                    fill
                    sizes="32px"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                  </div>
                )}
              </div>

              <div className="ml-3 flex-grow min-w-0 mr-2">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate block">
                  {user.username || user.name || 'User'}
                </span>
              </div>

              {hasStreak(user) && (
                <div className="ml-auto flex items-center text-xs flex-shrink-0">
                  {currentStreak > 10 && (
                    <div className="mr-1.5">
                      <Award className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                  
                  <div className={`flex items-center ${
                    currentStreak > 0
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  } px-2 py-0.5 rounded-full`}>
                    <Flame className="w-3 h-3 mr-1" />
                    <span className="font-medium">{currentStreak}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
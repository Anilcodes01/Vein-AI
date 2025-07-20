// src/components/Habits/StreaksModal.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { Habit } from "@/types";

type StreaksModalProps = {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
};

export default function StreaksModal({ isOpen, onClose, habits }: StreaksModalProps) {
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 },
    },
    exit: { y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div
            className="flex justify-center items-center h-full w-full p-4"
            onClick={onClose}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-2xl shadow-2xl p-6 lg:p-8 w-full md:w-2/3 lg:w-1/2 max-w-2xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Habit Streaks
                </h2>
                <button
                  onClick={onClose}
                  className="text-2xl text-gray-400 hover:text-red-500 transition-colors rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ×
                </button>
              </div>

              {habits.length > 0 ? (
                <ul className="space-y-4">
                  {habits.map((habit) => (
                    <li
                      key={habit.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{habit.icon}</span>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{habit.name}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-orange-500" title="Current Streak">
                          <Flame size={20} />
                          <span className="font-bold text-lg">{habit.currentStreak}</span>
                          <span className="text-gray-500 dark:text-gray-400">days</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-500" title="Longest Streak">
                          <Trophy size={20} />
                          <span className="font-bold text-lg">{habit.longestStreak}</span>
                           <span className="text-gray-500 dark:text-gray-400">days</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No habits found. Add a habit to start tracking your streaks!
                </p>
              )}

              <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-[#a99667] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#8b7d5c] transition-colors"
                  >
                    Close
                  </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
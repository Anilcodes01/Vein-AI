import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useOnClickOutside } from "@/hooks/use-framer";
import {
  AddHabitModalProps,
  HabitFormData,
  HabitType,
  DAYS_OF_WEEK,
} from "@/types";

export default function AddHabitModal({ isOpen, onClose, onHabitCreated }: AddHabitModalProps) {
  const [formData, setFormData] = useState<HabitFormData>({
    name: "",
    reason: "",
    icon: "💧",
    type: "COUNT",
    target: 3000,
    targetUnit: "ml",
    frequencyDays: [],
    timeOfDay: "ANY",
    hasReminder: true,
    reminderTime: "09:00",
    duration: 30,
  });

  const [isPickerVisible, setPickerVisible] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(pickerRef, () => setPickerVisible(false));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number = value;
    if (type === "number") {
      processedValue = value === "" ? 0 : parseInt(value, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as HabitType;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      target: newType === "COUNT" ? 10 : newType === "TIME" ? 15 : undefined,
      targetUnit:
        newType === "COUNT" ? "reps" : newType === "TIME" ? "mins" : undefined,
    }));
  };

  const handleToggleReminder = () => {
    setFormData((prev) => ({ ...prev, hasReminder: !prev.hasReminder }));
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setFormData((prev) => ({ ...prev, icon: emojiData.emoji }));
    setPickerVisible(false);
  };

  const setFrequency = (type: "daily" | "clear") => {
    const newFrequencyDays = type === "daily" ? [...DAYS_OF_WEEK] : [];
    setFormData((prev) => ({ ...prev, frequencyDays: newFrequencyDays }));
  };

  const toggleFrequencyDay = (day: string) => {
    setFormData((prev) => {
      const newFrequency = prev.frequencyDays.includes(day)
        ? prev.frequencyDays.filter((d) => d !== day)
        : [...prev.frequencyDays, day];
      return {
        ...prev,
        frequencyDays: newFrequency.sort(
          (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
        ),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/habits/createHabits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save the habit.");
      }

      onHabitCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
                  Add a New Habit
                </h2>
                <button
                  onClick={onClose}
                  className="text-2xl text-gray-400 hover:text-red-500 transition-colors rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="relative" ref={pickerRef}>
                    <button
                      type="button"
                      onClick={() => setPickerVisible(!isPickerVisible)}
                      className="text-4xl bg-gray-100 dark:bg-gray-700 rounded-lg p-3 w-20 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {formData.icon}
                    </button>
                    {isPickerVisible && (
                      <div className="absolute top-full mt-2 z-20">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-4">
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Habit Name (e.g., Drink Water)"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a99667] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      required
                    />
                    <textarea
                      id="reason"
                      name="reason"
                      placeholder='Reason (Your "Why")'
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a99667] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleTypeChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <option value="CHECK_IN">Check-in</option>
                      <option value="COUNT">Count</option>
                      <option value="TIME">Time</option>
                    </select>
                  </div>
                  {formData.type !== "CHECK_IN" && (
                    <>
                      <div className="md:col-span-1">
                        <label
                          htmlFor="target"
                          className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                        >
                          Target
                        </label>
                        <input
                          id="target"
                          type="number"
                          name="target"
                          value={formData.target || ""}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                          min={1}
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label
                          htmlFor="targetUnit"
                          className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                        >
                          Unit
                        </label>
                        <input
                          id="targetUnit"
                          type="text"
                          name="targetUnit"
                          placeholder={
                            formData.type === "COUNT" ? "reps, ml" : "mins"
                          }
                          value={formData.targetUnit || ""}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Frequency
                    </label>
                    <div>
                      <button
                        type="button"
                        onClick={() => setFrequency("daily")}
                        className="text-xs font-semibold text-[#a99667] mr-2 hover:underline"
                      >
                        Daily
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrequency("clear")}
                        className="text-xs font-semibold text-gray-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleFrequencyDay(day)}
                        className={`flex-grow px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          formData.frequencyDays.includes(day)
                            ? "bg-[#a99667] text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label
                      htmlFor="timeOfDay"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                      Time of Day
                    </label>
                    <select
                      id="timeOfDay"
                      name="timeOfDay"
                      value={formData.timeOfDay}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                    >
                      <option value="ANY">Any Time</option>
                      <option value="MORNING">Morning</option>
                      <option value="AFTERNOON">Afternoon</option>
                      <option value="EVENING">Evening</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                      Duration (days)
                    </label>
                    <input
                      id="duration"
                      type="number"
                      name="duration"
                      placeholder="e.g., 30"
                      value={formData.duration || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      min={1}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="hasReminder"
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <input
                          id="hasReminder"
                          type="checkbox"
                          className="sr-only"
                          checked={formData.hasReminder}
                          onChange={handleToggleReminder}
                        />
                        <div
                          className={`block w-14 h-8 rounded-full ${
                            formData.hasReminder
                              ? "bg-[#a99667]"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        ></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                            formData.hasReminder
                              ? "transform translate-x-6"
                              : ""
                          }`}
                        ></div>
                      </div>
                      <div className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Reminder
                      </div>
                    </label>
                  </div>
                </div>

                <AnimatePresence>
                  {formData.hasReminder && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <label
                        htmlFor="reminderTime"
                        className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Reminder Time
                      </label>
                      <input
                        id="reminderTime"
                        type="time"
                        name="reminderTime"
                        value={formData.reminderTime || ""}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                        required={formData.hasReminder}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div
                    className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                    role="alert"
                  >
                    <span className="font-medium">Error:</span> {error}
                  </div>
                )}

                <div className="flex justify-end items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-6 py-2 mr-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#a99667] cursor-pointer text-white font-bold px-6 py-2 rounded-lg hover:bg-[#8b7d5c] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a99667] focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-75 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Habit"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";
import {
  Loader2,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Drumstick,
  Send,
  Clock
} from "lucide-react";
import { useRef, useState, FormEvent, ChangeEvent, ReactNode } from "react";
import { TrackInputProps } from "@/lib/types";

export default function TrackInput({ onSubmit, isSubmitting }: TrackInputProps) {
  const [input, setInput] = useState("");
  const [mealTime, setMealTime] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 40)}px`; // 40px matches approx 2 rows of text-sm
    }
    if (e.target.value.trim() && mealTime) {
      setError(null);
    }
  };

  const handleMealTimeSelect = (time: string) => {
    setMealTime(time);
    if (input.trim()) {
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim() || !mealTime) {
      setError("Please enter food and select a meal time.");
      return;
    }
    if (isSubmitting) return;

    try {
      await onSubmit({
        input: input.trim(),
        mealTime: mealTime.toLowerCase(),
        timestamp: new Date().toISOString(),
      });
      setInput("");
      setMealTime(""); // Clear mealtime after submission
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // Reset textarea height
      }
    } catch (submitError) {
      console.error("Submission initiation failed in TrackInput:", submitError);
      // Optionally set an error state here to display to the user
      // setError("Failed to log entry. Please try again.");
    }
  };

  // Modified getMealIcon to accept a size parameter
  const getMealIcon = (meal: string, iconSize: number): ReactNode => {
    switch(meal.toLowerCase()) {
      case 'breakfast': return <Coffee size={iconSize} />;
      case 'lunch': return <UtensilsCrossed size={iconSize} />;
      case 'snack': return <Cookie size={iconSize} />;
      case 'dinner': return <Drumstick size={iconSize} />;
      default: return <Clock size={iconSize} />; // Default icon if mealtime is unexpected
    }
  };

  return (
    // Responsive outer container:
    // - Mobile: full width, max-w-4xl, centered, no padding (form uses full width)
    // - Desktop: md:ml-36 for sidebar, md:p-4 for padding around the form card
    <div className="w-full max-w-6xl mx-auto p-0 md:ml-36 md:mx-w-6xl md:p-">
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Meal time buttons area: responsive padding and button content */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 border-b border-gray-100 dark:border-gray-800">
            {(["breakfast", "lunch", "snack", "dinner"] as const).map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleMealTimeSelect(time)}
                className={`
                  flex items-center gap-1 sm:gap-1.5 px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm rounded-md transition-colors duration-150 ease-in-out
                  ${mealTime === time
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
                disabled={isSubmitting}
              >
                {/* Responsive icon size for meal buttons */}
                <span className="sm:hidden">{getMealIcon(time, 14)}</span>
                <span className="hidden sm:inline">{getMealIcon(time, 16)}</span>
                <span className="capitalize">{time}</span>
              </button>
            ))}
          </div>

          {/* Textarea area: responsive padding */}
          <div className="p-2 sm:p-3">
            <textarea
              ref={textareaRef}
              onChange={handleInput}
              value={input}
              placeholder="What did you eat or drink today?"
              className="w-full resize-none outline-none bg-transparent text-sm sm:text-base text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              rows={2} // min rows, will expand
              style={{ minHeight: "50px" }} // ensures a minimum height
              disabled={isSubmitting}
            />
          </div>

          {/* Error message: responsive padding and text size */}
          {error && (
            <div className="px-2 sm:px-3 pb-1 sm:pb-2 text-[11px] sm:text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Bottom bar: responsive padding, text, and icon sizes */}
          <div className="flex justify-between items-center px-2 py-1.5 sm:px-3 sm:py-2 border-t border-gray-100 dark:border-gray-800">
            <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
             {mealTime && (
                 <>
                    {/* Responsive icon size for selected meal time status */}
                    <span className="sm:hidden">{getMealIcon(mealTime, 11)}</span>
                    <span className="hidden sm:inline">{getMealIcon(mealTime, 12)}</span>
                    <span className="capitalize">{mealTime}</span>
                    <span className="mx-0.5 sm:mx-1">•</span>
                 </>
             )}
              <Clock size={typeof window !== 'undefined' && window.innerWidth < 640 ? 11 : 12} /> {/* Crude responsive check for demo, consider CSS or context for better SSR */}
              <span className="ml-0.5">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !input.trim() || !mealTime}
              className={`
                ml-auto flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 text-xs rounded-lg sm:px-4 sm:py-2 sm:text-sm font-medium transition-colors duration-150 ease-in-out
                ${isSubmitting || !input.trim() || !mealTime
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={typeof window !== 'undefined' && window.innerWidth < 640 ? 14 : 16} className="animate-spin" />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Send size={typeof window !== 'undefined' && window.innerWidth < 640 ? 14 : 16} />
                  <span>Log Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
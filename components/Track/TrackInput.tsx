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
import { useRef, useState, FormEvent, ChangeEvent } from "react";
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
      textarea.style.height = `${Math.max(textarea.scrollHeight, 40)}px`;
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
      setMealTime("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (submitError) {
      console.error("Submission initiation failed in TrackInput:", submitError);
    }
  };

  const getMealIcon = (meal: string) => {
    switch(meal) {
      case 'breakfast': return <Coffee size={16} />;
      case 'lunch': return <UtensilsCrossed size={16} />;
      case 'snack': return <Cookie size={16} />;
      case 'dinner': return <Drumstick size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="w-4xl ml-36 mx-auto p-0 md:p-4">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100 dark:border-gray-800">
            {(["breakfast", "lunch", "snack", "dinner"] as const).map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleMealTimeSelect(time)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ease-in-out
                  ${mealTime === time
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
                disabled={isSubmitting}
              >
                {getMealIcon(time)}
                <span className="capitalize">{time}</span>
              </button>
            ))}
          </div>

          <div className="p-3">
            <textarea
              ref={textareaRef}
              onChange={handleInput}
              value={input}
              placeholder="What did you eat or drink today?"
              className="w-full resize-none outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              rows={2}
              style={{ minHeight: "50px" }}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="px-3 pb-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
             {mealTime && (
                 <>
                    <span className="capitalize w-fit">{getMealIcon(mealTime)} </span>
                    <span>{mealTime}</span>
                    <span>•</span>
                 </>
             )}
              <Clock size={12} /> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !input.trim() || !mealTime}
              className={`
                ml-auto flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
                ${isSubmitting || !input.trim() || !mealTime
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
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
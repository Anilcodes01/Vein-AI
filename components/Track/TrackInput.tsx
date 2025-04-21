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
import { useRef, useState } from "react";

interface TrackInputProps {
  onSubmit: (data: { input: string; mealTime: string; timestamp: string }) => Promise<void>;
  isSubmitting: boolean;
}

export default function TrackInput({ onSubmit, isSubmitting }: TrackInputProps) {
  const [input, setInput] = useState("");
  const [mealTime, setMealTime] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.error("Submission failed:", submitError);
    }
  };

  // Get meal icon based on meal type
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
    <div className="w-full max-w-4xl mx-auto p-4 ">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          {/* Meal type selection */}
          <div className="flex gap-2 p-3 border-b border-gray-100 dark:border-gray-800">
            {(["breakfast", "lunch", "snack", "dinner"] as const).map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleMealTimeSelect(time)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                  ${mealTime === time 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                {getMealIcon(time)}
                <span className="capitalize">{time}</span>
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="p-3">
            <textarea
              ref={textareaRef}
              onChange={handleInput}
              value={input}
              placeholder="What did you eat or drink?"
              className="w-full resize-none outline-none bg-transparent text-gray-800 dark:text-white"
              rows={1}
              style={{ minHeight: "50px" }}
              disabled={isSubmitting}
            />
          </div>
          
          {error && (
            <div className="px-3 pb-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            {mealTime && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="capitalize">{mealTime}</span> • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !input.trim() || !mealTime}
              className={`
                ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                ${isSubmitting || !input.trim() || !mealTime
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
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
                  <span>Log</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
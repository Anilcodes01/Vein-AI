"use client";
import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";

interface TrackInputProps {
  onSubmit: (data: { 
    input: string; 
    mealTime: string;
    timestamp: string;
  }) => Promise<void>;
}

export default function TrackInput({ onSubmit }: TrackInputProps) {
  const [input, setInput] = useState("");
  const [mealTime, setMealTime] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleMealTimeSelect = (time: string) => {
    setMealTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !mealTime) return;
    
    await onSubmit({
      input: input.trim(),
      mealTime: mealTime.toLowerCase(),
      timestamp: new Date().toISOString()
    });
    
    setInput("");
    setMealTime("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="mt-16 flex gap-4 ml-24">
          <button 
            type="button"
            onClick={() => handleMealTimeSelect("breakfast")}
            className={`relative border rounded-lg px-2 py-1 text-black border-white cursor-pointer overflow-hidden group backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:text-gray-900 ${
              mealTime === "breakfast" ? "bg-white/40" : "bg-white/20"
            }`}
          >
            <span className="relative text-sm z-10">Breakfast</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
          <button 
            type="button"
            onClick={() => handleMealTimeSelect("lunch")}
            className={`relative border rounded-lg px-2 py-1 text-black border-white cursor-pointer overflow-hidden group backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:text-gray-900 ${
              mealTime === "lunch" ? "bg-white/40" : "bg-white/20"
            }`}
          >
            <span className="relative text-sm z-10">Lunch</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
          <button 
            type="button"
            onClick={() => handleMealTimeSelect("snack")}
            className={`relative border rounded-lg px-2 py-1 text-black border-white cursor-pointer overflow-hidden group backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:text-gray-900 ${
              mealTime === "snack" ? "bg-white/40" : "bg-white/20"
            }`}
          >
            <span className="relative text-sm z-10">Snack Time</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
          <button 
            type="button"
            onClick={() => handleMealTimeSelect("dinner")}
            className={`relative border rounded-lg px-2 py-1 text-black border-white cursor-pointer overflow-hidden group backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:text-gray-900 ${
              mealTime === "dinner" ? "bg-white/40" : "bg-white/20"
            }`}
          >
            <span className="relative text-sm z-10">Dinner</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
        </div>
        <div className="border rounded-2xl flex flex-col items-end justify-end outline-none resize-none text-black p-3 h-auto max-w-6xl w-4xl ml-24 text-sm border-white">
          <textarea
            ref={textareaRef}
            onInput={handleInput}
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="What did you just ate...!"
            className="resize-none outline-none w-full overflow-hidden"
            rows={1}
          ></textarea>
          <button 
            type="submit"
            className="relative border flex justify-end items-end h-auto rounded-full px-1 py-1 text-black border-white cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
          >
            <span className="relative z-10">
              <ArrowUp size={20} />
            </span>
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
        </div>
      </form>
    </div>
  );
}
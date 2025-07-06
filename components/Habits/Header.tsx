// components/HabitsHeader.js (Modified)
type HabitsHeaderProps = {
  onAddHabitClick: () => void;
};

export default function HabitsHeader({ onAddHabitClick }: HabitsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 lg:mb-8">
      <div className="flex flex-col">
        <h1 className="lg:text-4xl text-2xl font-bold ">Habits</h1>
        <p className="text-[#a99667] text-sm lg:text-base mt-2">
          Track your habits and gain insights into your habits and consistency.
        </p>
      </div>
      <div>
        <button
          onClick={onAddHabitClick} // Use the passed-in function
          className="bg-[#a99667] cursor-pointer text-white px-4 py-2 rounded-lg mt-4 lg:mt-0 hover:bg-[#8b7d5c] transition-colors"
        >
          Add Habit
        </button>
      </div>
    </div>
  );
}
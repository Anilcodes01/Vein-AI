import { useDashboard } from "@/contexts/DashboardContext";

export default function MotivationalQuote() {
  const {
    motivationalQuote,
    quoteLoading,
    quoteError,
    
  } = useDashboard();

  return (
    <div className="rounded-xl ">
      <div className="min-h-16">
        {quoteLoading ? (
          <div className="flex items-center justify-center py-4">
            {/* Health-themed pulse loading animation */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-green-100 flex items-center justify-center">
                <div className="absolute w-10 h-10 rounded-full bg-green-400 opacity-30 animate-ping"></div>
                <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -left-2 -top-2 text-green-200 text-4xl font-serif">"</div>
            <p className="text-lg text-center font-medium text-gray-800 px-6 py-2">
              {motivationalQuote}
            </p>
            <div className="absolute -bottom-2 -right-2 text-green-200 text-4xl font-serif">"</div>
          </div>
        )}
      </div>

      {quoteError && (
        <div className="mt-2 p-2 bg-red-50 rounded-md">
          <p className="text-xs text-red-500">{quoteError}</p>
        </div>
      )}
    </div>
  );
}
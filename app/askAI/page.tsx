// src/app/ask-ai/page.tsx (or your actual path)
"use client"; // Keep if needed for Sidebar or other hooks

import AskAIComp from "@/components/AskAI/AskAIComp";
import Sidebar from "@/components/Landing/Sidebar"; // Assuming Sidebar has a defined width

export default function AskAi() {
    return (
        // Flex container for the whole page layout
        <div className="flex h-screen overflow-hidden bg-gray-100"> {/* Prevent body scroll */}
            <Sidebar /> {/* Sidebar should have its own width (e.g., w-64) */}

            {/* Main content area that takes remaining space */}
            <div className="flex-1 overflow-hidden"> {/* Allow AskAIComp to fill this */}
                <AskAIComp />
            </div>
        </div>
    );
}
"use client";
import { useState } from 'react';
import AskAIComp from "@/components/AskAI/AskAIComp"; // Main content for this page
import ChatSidebar from "@/components/AskAI/ChatSidebar"; // Right sidebar
import Sidebar from "@/components/Landing/Sidebar"; // Main sidebar (left)
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import clsx from 'clsx';
// PreviousConv is not used here

export default function AskAi() {
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Main Sidebar (Left) */}
            {/* Assuming Sidebar component handles its own responsive behavior */}
            <div className="hidden md:block"> {/* Example: Show only on md and up. Adjust if Sidebar has different behavior */}
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden"> {/* Added flex flex-col for internal layout */}
                <AskAIComp />
            </div>

            {/* Chat Sidebar Toggle Button (Right) */}
            <Button
                variant="outline"
                size="icon"
                className="fixed top-20 right-4 z-20 cursor-pointer bg-white hover:bg-gray-50 rounded-full shadow md:absolute" // Use fixed for mobile
                onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                aria-label={isChatSidebarOpen ? "Close chat sidebar" : "Open chat sidebar"}
            >
                {isChatSidebarOpen ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </Button>

            {/* Chat Sidebar (Right, slide-in) */}
            <div
                className={clsx(
                    "fixed md:absolute bg-white right-0 top-0 md:top-16", // Full height on mobile, specific top on md+
                    "w-full sm:w-72 md:w-72", // Full width on smallest, then 72
                    "h-full md:h-[calc(100vh-4rem)]", // Full height on mobile
                    "shadow-lg",
                    "z-10",
                    "transition-transform duration-300 ease-in-out",
                    {
                        'translate-x-0': isChatSidebarOpen,
                        'translate-x-full': !isChatSidebarOpen,
                    }
                )}
            >
                <div className="h-full w-full overflow-y-auto">
                     {/* Button to close sidebar on mobile, inside the sidebar */}
                     <div className="md:hidden p-2 text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsChatSidebarOpen(false)}
                            aria-label="Close chat sidebar"
                        >
                            <ChevronsRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <ChatSidebar />
                </div>
            </div>
        </div>
    );
}
"use client";
import { useState } from 'react';
import AskAIComp from "@/components/AskAI/AskAIComp";
import ChatSidebar from "@/components/AskAI/ChatSidebar";
import Sidebar from "@/components/Landing/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import clsx from 'clsx';
import PreviousConv from '@/components/AskAI/PreviousConv';

export default function PreviousChat() {
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden  bg-gray-100 ">
            <div className="">
                <Sidebar />
            </div>

            <div className="flex-1 overflow-hidden">
                <PreviousConv />
            </div>

            <Button
                variant="outline"
                size="icon"
                className="absolute top-20 right-4 z-20 cursor-pointer bg-white hover:bg-gray-50 rounded-full shadow"
                onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                aria-label={isChatSidebarOpen ? "Close chat sidebar" : "Open chat sidebar"}
            >
                {isChatSidebarOpen ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </Button>

            <div
                className={clsx(
                    "w-72 absolute bg-white right-0 top-16",
                    "h-[calc(100vh-4rem)]",
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
                    <ChatSidebar />
                </div>
            </div>
        </div>
    );
}

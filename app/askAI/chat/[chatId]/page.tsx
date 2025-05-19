"use client";
import { useState } from 'react';
import ChatSidebar from "@/components/AskAI/ChatSidebar";
import Sidebar from "@/components/Landing/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import clsx from 'clsx';
import PreviousConv from '@/components/AskAI/PreviousConv';
import Appbar from '@/components/Landing/Appbar';

export default function PreviousChat() {
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <div className='top-0 fixed w-full'>
                <Appbar />
            </div>
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <div className="flex flex-1 relative overflow-hidden">
                <PreviousConv />
            </div>

            <Button
                variant="outline"
                size="icon"
                className="fixed top-20 right-4 z-20 cursor-pointer bg-white hover:bg-gray-50 rounded-full shadow md:absolute"
                onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
                aria-label={isChatSidebarOpen ? "Close chat sidebar" : "Open chat sidebar"}
            >
                {isChatSidebarOpen ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </Button>

            <div
                className={clsx(
                    "fixed md:absolute bg-white right-0 top-0 md:top-16",
                    "w-full sm:w-72 md:w-72",
                    "h-full md:h-[calc(100vh-4rem)]",
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
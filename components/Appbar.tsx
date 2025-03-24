'use client'
import Image from "next/image";
import { Button } from "./ui/button";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader } from "lucide-react";

export default function Appbar() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [animateNav, setAnimateNav] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        if(status !== "loading") {
            setInitialLoading(false);
        }
        
        // Add animation on mount
        setTimeout(() => {
            setAnimateNav(true);
        }, 100);
    }, [status, session]);

    return (
        <div className={`flex h-16 bg-white w-full items-center justify-between border-b border-gray-100 px-12 transition-all duration-500 ${
            animateNav ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        } sticky top-0 z-50 backdrop-blur-sm bg-white/90`}>
            <div className="flex items-center gap-2 justify-center h-16 group cursor-pointer transition-transform duration-300 hover:scale-105">
                <div className="relative overflow-hidden">
                    <Image 
                        src="/logo-veinai.png" 
                        alt="logo" 
                        width={200} 
                        height={200} 
                        className="h-8 w-8 transition-transform duration-300 group-hover:rotate-6"
                    />
                </div>
                <h1 className="text-2xl text-gray-800 font-bold relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-800 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">Vein AI</span>
                </h1>
            </div>
            
            <div className="transition-all duration-300 hover:scale-105">
                {initialLoading && status === "loading" ? (
                    <Loader size={24} className="animate-spin text-purple-500" />
                ) : (
                    !session ? (
                        <Button 
                            onClick={() => signIn("google")} 
                            className="cursor-pointer bg-black text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:shadow-md"
                        >
                            Login
                        </Button>
                    ) : (
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                            <Avatar className="relative border-2 border-transparent group-hover:border-white transition-all duration-300">
                                <AvatarImage src={session.user?.image || ""} className="transition-transform duration-300 group-hover:scale-105" />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                                    {session.user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
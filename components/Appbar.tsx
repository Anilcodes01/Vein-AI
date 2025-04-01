'use client'
import Image from "next/image";
import {  useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Appbar() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [animateNav, setAnimateNav] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if(status !== "loading") {
            setInitialLoading(false);
        }

        setTimeout(() => {
            setAnimateNav(true);
        }, 100);
    }, [status, session]);

    return (
        <div className={`flex h-16 bg-white w-full items-center justify-between border-b border-gray-100 px-12 transition-all duration-500 ${
            animateNav ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        } sticky top-0 z-50 backdrop-blur-sm bg-white/90`}>
            <div onClick={() => router.push('/')} className="flex items-center gap-2 justify-center h-16 group cursor-pointer transition-transform duration-300 hover:scale-105">
                <div className="relative overflow-hidden">
                    <Image 
                        src="/logo1.png" 
                        alt="logo" 
                        width={200} 
                        height={200} 
                        className="h-16 w-16 transition-transform duration-300 "
                    />
                </div>
                <h1 className="text-2xl text-green-600 font-bold relative">
                    <span className="bg-clip-text text-green-700 bg-gradient-to-r from-gray-800 to-gray-800 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">Vein </span>
                </h1>
            </div>
            
            <div className="transition-all duration-300 hover:scale-105">
                {initialLoading && status === "loading" ? (
                    <Loader size={24} className="animate-spin text-purple-500" />
                ) : (
                    !session ? (
                        <div className="flex gap-4">
                            <button
                        onClick={() => router.push("/auth/login")}
                        className="relative border rounded-full px-6 py-1 text-black border-gray-200 cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
                      >
                        <span className="relative z-10">Login</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
                      </button>
                            <button
                        onClick={() => router.push("/auth/register")}
                        className="relative border rounded-full px-6 py-1 text-black border-gray-200 cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
                      >
                        <span className="relative z-10">Register</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
                      </button>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                            <Avatar className="relative border-2 border-transparent group-hover:border-white transition-all duration-300">
                                <AvatarImage src={session.user?.image || ""} className="transition-transform duration-300 group-hover:scale-105" />
                                <AvatarFallback className="bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC]">
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
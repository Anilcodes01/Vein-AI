'use client'

import { useRef, useState, useEffect } from "react"

export default function AskAIComp() {
    const [input, setInput] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [userData, setUserData] = useState([]);

      useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [chat]);

    return <div className="flex flex-col bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] pl-64 items-center justify-center min-h-screen p-6">
       <div className="flex rounded-2xl  border border-white/40 bg-white/30 backdrop-blur-md  w-4xl h-[80vh]">
        <div>
           
        </div>

       </div>
    </div>
}
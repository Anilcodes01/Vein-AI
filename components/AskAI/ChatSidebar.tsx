"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PuffLoader } from "react-spinners";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
}

export default function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/askAI/previousChats");
        const data = res.data.conversations;

        if (res.status === 200) {
          setConversations(data);
        }
      } catch (error) {
        console.error("error fetching conversations...!", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchConversation();
    }
  }, [session]);

  return (
    <div className="flex flex-col py-2 px-2 w-full h-full text-black bg-">
      <div className="border rounded-lg h-fit flex items-center w-full justify-start mb-4 p-2 bg-white">
        <Image
          src="/logot.png"
          height={200}
          width={200}
          alt="logo.png"
          className="h-16 w-16"
        />
        <h1 className="text-3xl text-green-700 font-bold">Vein</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2 px-2">Previous Chats</h2>
        <div className="space-y-1 flex items-start px-2  w-full flex-col">
          {loading ? (
            <div className="flex items-center h-full mt-48 justify-center p-">
              <PuffLoader color="#E56AB3" size={48} />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation, index) => (
              <button
              key={index}
            onClick={() => router.push(`/askAI/chat/${conversation.id}`)}
            className="relative border rounded-lg px-2 w-full text-start py-2 text-black border-white cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
          >
            <span className="relative z-10">
              {conversation.title}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
              
            ))
          ) : (
            <p className="p-2 text-gray-500">
              {session ? "No conversations yet" : "Sign in to view conversations"}
            </p>
          )}
        </div>
      </div>

      {session && (
        <div className="mt-auto p-2 border-t flex items-center gap-2">
          {session.user?.image && (
            <Image
              src={session.user.image}
              width={32}
              height={32}
              alt="User profile"
              className="rounded-full"
            />
          )}
          <span className="font-medium">{session.user?.name}</span>
        </div>
      )}
    </div>
  );
}
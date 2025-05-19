"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
// Link import was unused, can be removed if not redirecting via Link component
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
    } else {
        setLoading(false); // Stop loading if no session
    }
  }, [session]);

  return (
    // py-2 px-2 applied to give some internal padding from edges of sidebar
    <div className="flex flex-col py-2 px-2 w-full h-full text-black"> {/* Removed bg- as it's set by parent */}
      <div className="border rounded-lg h-fit flex items-center w-full justify-start mb-3 p-1.5 sm:p-2 bg-white">
        <Image
          src="/logot.png"
          height={160} // Max height for quality
          width={160}  // Max width for quality
          alt="logo.png"
          className="h-10 w-10 sm:h-12 sm:w-12" // Smaller image for sidebar
        />
        <h1 className="text-xl sm:text-2xl text-green-700 font-bold ml-2">Vein</h1> {/* Smaller title */}
      </div>

      <div className="flex-1 overflow-y-auto">
        <h2 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 px-1 sm:px-2">Previous Chats</h2>
        <div className="space-y-1 flex items-start px-1 sm:px-2 w-full flex-col">
          {loading ? (
            // Adjusted PuffLoader size and centering for sidebar context
            <div className="flex items-center justify-center w-full h-32 mt-4"> 
              <PuffLoader color="#E56AB3" size={36} />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation, index) => (
              <button
                key={index}
                onClick={() => router.push(`/askAI/chat/${conversation.id}`)}
                // Adjusted padding and text size for better fit and readability
                className="relative border rounded-md sm:rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 w-full text-left text-xs sm:text-sm text-black border-white cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-md hover:scale-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <span className="relative z-10 block truncate"> {/* Ensure long titles are truncated */}
                  {conversation.title}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
              </button>
            ))
          ) : (
            <p className="p-2 text-xs sm:text-sm text-gray-500">
              {session ? "No conversations yet" : "Sign in to view conversations"}
            </p>
          )}
        </div>
      </div>

      {session && (
        <div className="mt-auto p-1.5 sm:p-2 border-t flex items-center gap-1.5 sm:gap-2">
          {session.user?.image && (
            <Image
              src={session.user.image}
              width={28} // Slightly smaller user image
              height={28}
              alt="User profile"
              className="rounded-full h-7 w-7 sm:h-8 sm:w-8"
            />
          )}
          <span className="font-medium text-xs sm:text-sm truncate">{session.user?.name}</span>
        </div>
      )}
    </div>
  );
}
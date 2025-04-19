"use client";
import { useRef, useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ChatMessage } from "@/lib/types"; 
import { useParams } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { toast, Toaster } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PreviousConv() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false); 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const chatId = params?.chatId as string | undefined; 

  useEffect(() => {
    if (!chatId) {
      setError("Chat ID is missing.");
      setLoading(false);
      return;
    }

    const fetchChat = async () => {
      setLoading(true);
      setError(null);
      setChat([]); 
      try {
        const res = await axios.get(`/api/askAI/${chatId}`); 
        const fetchedChatData = res.data.chat?.messages;

        if (res.status === 200 && fetchedChatData) {
          const formattedMessages = fetchedChatData.map((msg: any) => ({
            role: msg.role === "ai" ? "assistant" : msg.role,
            content: msg.content
          }));
          setChat(formattedMessages);
        } else {
          toast.error("Invalid Conversation Id or no messages found!");
          setError("Could not load conversation.");
          setChat([]);
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
        setError("Failed to load chat history. Please try again later.");
        toast.error("Failed to load chat history.");
        setChat([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]); 

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSending || loading || !chatId) return;

    const userMessageContent = input;
    const userMessage: ChatMessage = {
      role: "user",
      content: userMessageContent,
    };

    setChat((prevChat) => [...prevChat, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await axios.post("/api/askAI", { 
        message: userMessageContent,
        conversationId: chatId,
      });

      const aiResponseContent = response.data.response;

      if (aiResponseContent) {
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: aiResponseContent,
        };
        setChat((prevChat) => [...prevChat, aiMessage]);
      } else {
         toast.error("Received an empty response from the assistant.");
         setChat((prevChat) => prevChat.slice(0, -1)); 
      }

    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      toast.error("Failed to send message.");
      setChat((prevChat) => prevChat.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br items-center from-[#FFDEE9] to-[#B5FFFC] overflow-hidden">
      <Toaster position="top-right" richColors />
      <div>
        <h1>
            {}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 w-full max-w-4xl mt-16 ml-0 md:ml-44 md:p-6 hide-scrollbar">
        {loading && chat.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <BeatLoader color="#E56AB3" size={15} />
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-red-600 bg-red-100 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

{(!loading || chat.length > 0) && (
    <div className="space-y-8">
      {chat.map((msg, index) => (
        <motion.div
          key={index}
          initial="hidden"
          animate="visible"
          variants={messageVariants}
          transition={{ duration: 0.3 }}
          className={`flex w-full ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`rounded-3xl px-4 py-2 break-words ${
              msg.role === "user"
                ? "bg-white max-w-[70%] text-black"
                : " text-black markdown-container"
            }`}
          >
            {typeof msg.content === "string" ? (
              msg.role === "user" ? (
                msg.content.split("\n").map((line, i) => (
                  <p key={i} className="mb-0 leading-relaxed">
                    {line || "\u00A0"}
                  </p>
                ))
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-3" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    a: ({ node, ...props }) => (
                      <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm" {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre className="bg-gray-100 rounded p-3 overflow-x-auto my-3 text-sm" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props} />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )
            ) : (
              <p className="text-red-500 italic">Invalid message content</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )}

        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mt-4"
          >
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] shadow-sm">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} className="h-1" />
      </div>

      <div className="p-3 md:p-4 w-full max-w-4xl mx-auto md:ml-44 sticky bottom-0 bg-gradient-to-t from-[#B5FFFC]/50 via-[#B5FFFC]/20 to-transparent backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center ml-0 md:ml-44 gap-3 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatId ? "Continue this conversation..." : "Select a conversation first"}
            disabled={loading || isSending || !chatId || !!error} 
            className="flex-1 px-5 py-3 h-12 bg-white rounded-full outline-none disabled:opacity-50 focus:ring-2 focus:ring-pink-300 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || isSending || !input.trim() || !chatId || !!error}
            className="relative border rounded-full px-6 py-3 text-black border-white cursor-pointer overflow-hidden group bg-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:scale-105 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10">Send</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
        </form>
      </div>
    </div>
  );
}
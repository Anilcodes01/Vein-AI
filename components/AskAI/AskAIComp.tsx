"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addMessage, setLoading } from "@/store/chatSlice";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ChatMessage, ApiResponse } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

export default function AskAIComp() {
  const [input, setInput] = useState("");
  const chat = useSelector((state: RootState) => state.chat.chat);
  const loading = useSelector((state: RootState) => state.chat.loading);
  const dispatch = useDispatch();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState("");
  const [conversationId, setConversationId] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  async function sendMessage(message: string): Promise<void> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newUserMessage: ChatMessage = {
      role: "user",
      content: trimmedMessage,
    };
    dispatch(addMessage(newUserMessage));
    setInput("");
    dispatch(setLoading(true));

    try {
      const { data } = await axios.post<ApiResponse>("/api/askAI", {
        message: trimmedMessage, 
        conversationId
      });
      setConversationId(data.conversationId || "");
      const assistantResponse = data.response || "Sorry, I couldn't generate a response.";
      dispatch(addMessage({ role: "assistant", content: assistantResponse }));
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(addMessage({ 
        role: "assistant", 
        content: "Oops, something went wrong. Please try again!" 
      }));
    } finally {
      dispatch(setLoading(false));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br items-center from-[#FFDEE9] to-[#B5FFFC] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 w-4xl mt-16 ml-44 md:p-6 hide-scrollbar">
        {chat.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-green-100 p-2 md:p-2 rounded-full mb-4">
             <Image src="/logot.png" alt="logo" width={200} height={200} className="h-20 w-20" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
              Welcome to Vein
            </h2>
            <p className="text-gray-600 max-w-md text-sm md:text-base">
              I'm here to help you with your fitness goals. Ask me anything
              about nutrition, workouts, or general health advice.
            </p>
          </div>
        )}

        <div className="space-y-4">
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
                className={`rounded-3xl px-4 py-2 ${
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
                          <a 
                            className="text-blue-600 hover:underline" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props} 
                          />
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

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mt-4"
          >
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] shadow-sm">
              <div className="flex space-x-2">
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

      <div className="p-3 md:p-4 w-4xl ml-44">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 w-full max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health question..."
            disabled={loading}
            className="flex-1 px-5 py-3 h-12 bg-white rounded-full outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="relative border rounded-full px-6 py-3 text-black border-white cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
          >
            <span className="relative z-10">Ask Vein</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
        </form>
      </div>
    </div>
  );
}
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

// Ensure this CSS utility is defined, e.g., in your globals.css
// .hide-scrollbar::-webkit-scrollbar { display: none; }
// .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

export default function AskAIComp() {
  const [input, setInput] = useState("");
  const chat = useSelector((state: RootState) => state.chat.chat);
  const loading = useSelector((state: RootState) => state.chat.loading);
  const dispatch = useDispatch();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const messageVariants = {
    hidden: { opacity: 0, y: 10 }, // slightly less y
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
        conversationId,
      });
      setConversationId(data.conversationId || "");
      const assistantResponse =
        data.response || "Sorry, I couldn't generate a response.";
      dispatch(addMessage({ role: "assistant", content: assistantResponse }));
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(
        addMessage({
          role: "assistant",
          content: "Oops, something went wrong. Please try again!",
        })
      );
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
    // Main container: md:ml-44 for desktop sidebar. This means on <md, it uses full width.
    <div className="flex flex-col h-full bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] overflow-hidden md:ml-44"> {/* Keep md:ml-44 if your Sidebar setup requires it */}
      {/* Chat Area: Takes remaining space, scrolls. */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 mt-4 sm:mt-6 md:mt-8 hide-scrollbar w-full">
        <div className="max-w-full px-1 sm:px-0 sm:max-w-3xl mx-auto w-full"> {/* Allow full width on smallest screens, then max-w-3xl */}
          {chat.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-green-100/50 p-2 rounded-full mb-3 sm:mb-4">
                <Image
                  src="/logot.png"
                  alt="logo"
                  width={64} // Base size for mobile (w-16)
                  height={64} // Base size for mobile (h-16)
                  className="h-16 w-16 sm:h-20 sm:w-20" // sm breakpoint increases size
                />
              </div>
              <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-gray-700 mb-1 sm:mb-2">
                Welcome to Vein
              </h2>
              <p className="text-gray-600 max-w-md text-xs sm:text-sm md:text-base px-2 sm:px-0">
                I'm here to help you with your fitness goals. Ask me anything
                about nutrition, workouts, or general health advice.
              </p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
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
                  className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm md:text-base shadow-sm break-words ${
                    msg.role === "user"
                      ? "bg-white text-black max-w-[85%] sm:max-w-[80%] md:max-w-[70%]" // Slightly more width on mobile
                      : "bg-white/80 backdrop-blur-sm text-black max-w-[95%] sm:max-w-[90%] md:max-w-[85%] markdown-container"
                  }`}
                >
                  {typeof msg.content === "string" ? (
                    msg.role === "user" ? (
                       msg.content.split("\n").map((line, i) => (
                        <p key={i} className="mb-0 leading-relaxed"> {/* Removed break-words from here, parent has it */}
                          {line || "\u00A0"}
                        </p>
                      ))
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => <p className="text-xs sm:text-sm md:text-base mb-1 md:mb-1.5 last:mb-0" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-lg sm:text-xl md:text-2xl font-bold my-1 sm:my-1.5 md:my-3" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base sm:text-lg md:text-xl font-bold my-1 sm:my-1.5 md:my-3" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm sm:text-base md:text-lg font-bold my-0.5 sm:my-1 md:my-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 sm:pl-5 my-1 sm:my-1.5 md:my-2 text-xs sm:text-sm md:text-base" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 sm:pl-5 my-1 sm:my-1.5 md:my-2 text-xs sm:text-sm md:text-base" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-0.5 md:mb-1" {...props} />,
                          a: ({ node, ...props }) => (
                            <a
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                          code: ({ node,  ...props }) => {
                            const match = /language-(\w+)/.exec(props.className || '')
                            return match ? (
                               <pre className="bg-gray-100 dark:bg-gray-800 rounded p-1.5 sm:p-2 md:p-3 overflow-x-auto my-1 sm:my-1.5 md:my-3 text-xs sm:text-sm"><code className={props.className} {...props} /></pre>
                            ) : (
                                <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-2xs sm:text-xs md:text-sm" {...props} />
                            )
                          },
                          pre: ({ node, ...props }) => (
                            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-1.5 sm:p-2 md:p-3 overflow-x-auto my-1 sm:my-1.5 md:my-3 text-xs sm:text-sm" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-2 sm:pl-3 md:pl-4 italic text-gray-600 my-1 sm:my-1.5 md:my-2 text-xs sm:text-sm md:text-base" {...props} />
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
              className="flex justify-start mt-3 sm:mt-4"
            >
              <div className="bg-white/80 backdrop-blur-sm text-gray-800 rounded-lg sm:rounded-xl rounded-bl-none px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] shadow-sm">
                <div className="flex space-x-1 sm:space-x-1.5"> {/* Slightly smaller dots and spacing for mobile */}
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} className="h-1" />
        </div>
      </div>

      {/* Input Area: Fixed at bottom */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-white/20 bg-transparent">
        <div className="max-w-full sm:max-w-3xl mx-auto"> {/* Allow full width on smallest screens */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full" // items-stretch for mobile
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health question..."
              disabled={loading}
              className="flex-1 w-full px-3 py-2 sm:px-4 sm:py-2.5 h-10 sm:h-11 md:h-12 bg-white rounded-full outline-none text-sm md:text-base placeholder-gray-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="relative w-full sm:w-auto border rounded-full px-4 py-2 sm:px-5 md:px-6 sm:py-2.5 md:py-3 h-10 sm:h-11 md:h-12 text-sm md:text-base text-black border-white cursor-pointer overflow-hidden group bg-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/50 hover:shadow-lg hover:scale-105 hover:text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10">Ask Vein</span>
              <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
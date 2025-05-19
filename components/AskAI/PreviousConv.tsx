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
          toast.error(res.data.message || "Invalid Conversation Id or no messages found!");
          setError(res.data.message || "Could not load conversation.");
          setChat([]);
        }
      } catch (err: any) {
        console.error("Error fetching chat history:", err);
        const errorMsg = err.response?.data?.message || "Failed to load chat history. Please try again later.";
        setError(errorMsg);
        toast.error(errorMsg);
        setChat([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isSending]); 

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isSending || loading || !chatId || error) return; // Added error check

    const userMessageContent = input;
    const userMessage: ChatMessage = {
      role: "user",
      content: userMessageContent,
    };

    setChat((prevChat) => [...prevChat, userMessage]);
    setInput("");
    setIsSending(true);
    // setError(null); // Keep existing error until successful send if desired, or clear here

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
        setError(null); // Clear error on successful send
      } else {
         toast.error("Received an empty response from the assistant.");
         // Rollback optimistic update of user message if AI response fails critically
         setChat((prevChat) => prevChat.filter(msg => msg !== userMessage));
      }

    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMsg = err.response?.data?.message || "Failed to send message. Please try again.";
      setError(errorMsg); // Set error state for UI feedback
      toast.error(errorMsg);
      // Rollback optimistic update of user message
      setChat((prevChat) => prevChat.filter(msg => msg !== userMessage));
    } finally {
      setIsSending(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 }, // Consistent with AskAIComp
    visible: { opacity: 1, y: 0 },
  };

  return (
    // Main container: md:ml-44 for desktop sidebar.
    <div className="flex flex-col  bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] w-full mt-16 md:pl-44">
      <Toaster position="top-right" richColors />
      {/* Removed empty h1 div */}
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-2 mt-4 sm:mt-6 md:mt-8 hide-scrollbar w-full">
        <div className="max-w-full px-1 sm:px-0 sm:max-w-3xl mx-auto w-full"> {/* Consistent with AskAIComp */}
          {loading && chat.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <BeatLoader color="#E56AB3" size={12} className="mt-64"/> {/* Slightly smaller loader */}
            </div>
          )}

          {error && !loading && chat.length === 0 && ( // Show critical error prominently if no chat loaded
            <div className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4 mx-auto max-w-md">
              {error}
            </div>
          )}

          {(!loading || chat.length > 0) && ( // Render chat if not loading OR if chat has content (even if loading more)
            <div className="space-y-3 sm:space-y-4"> {/* Consistent spacing */}
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
                     className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-2 sm:py-2.5 text-xs sm:text-sm md:text-base break-words ${
                        msg.role === "user"
                          ? "bg-white text-black max-w-[85%] sm:max-w-[80%] md:max-w-[70%]"
                          : " text-black max-w-[95%] sm:max-w-[90%] md:max-w-[85%] markdown-container" // Added backdrop for assistant
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
                          components={{ // Responsive markdown components, similar to AskAIComp
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
                              <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
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
          )}

          {isSending && ( // Loading indicator for sending message
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mt-3 sm:mt-4" // Consistent with AskAIComp
            >
              <div className="bg-white/80 backdrop-blur-sm text-gray-800 rounded-lg sm:rounded-xl rounded-bl-none px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] shadow-sm">
                <div className="flex space-x-1 sm:space-x-1.5">
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

      {/* Input Area */}
      {/* Removed md:ml-44 from here, as parent div handles it. Sticky and backdrop for better UX. */}
      <div className="p-2 sm:p-3 md:p-4 border-t border-white/20 bg-transparent sticky bottom-0 bg-gradient-to-t from-[#B5FFFC]/80 via-[#B5FFFC]/50 to-transparent backdrop-blur-sm">
        <div className="max-w-full sm:max-w-3xl mx-auto"> {/* Consistent with AskAIComp */}
          <form
            onSubmit={handleSendMessage}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full" // Consistent with AskAIComp
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={error && !chatId ? "Error loading chat" : (!chatId ? "Select a conversation" : "Continue this conversation...")}
              disabled={loading || isSending || !chatId || !!error} 
              className="flex-1 w-full px-3 py-2 sm:px-4 sm:py-2.5 h-10 sm:h-11 md:h-12 bg-white rounded-full outline-none text-sm md:text-base placeholder-gray-400 shadow-sm disabled:opacity-60 focus:ring-2 focus:ring-pink-300"
            />
            <button
              type="submit"
              disabled={loading || isSending || !input.trim() || !chatId || !!error}
              className="relative w-full sm:w-auto border rounded-full px-4 py-2 sm:px-5 md:px-6 sm:py-2.5 md:py-3 h-10 sm:h-11 md:h-12 text-sm md:text-base text-black border-white cursor-pointer overflow-hidden group bg-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:scale-105 hover:text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10">Send</span>
              <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const chatEndRef = useRef(null);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current.onresult = (event) => {
        if (isSpeaking) {
          if (isListening) stopListening();
          return;
        }

        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setInput(transcript);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        if (event.results[0].isFinal) {
          silenceTimerRef.current = setTimeout(() => {
            const finalTranscript = transcript.trim();
            if (finalTranscript) {
              sendMessage(finalTranscript);
            }
            setInput("");
          }, 800);
        }
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.error("Speech recognition error:", event.error);
        }
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };
    }

    // Initialize speech synthesis
    speechSynthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (speechSynthesisRef.current?.speaking) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Web Speech API TTS function
  function speakWithWebSpeech(text) {
    if (!text.trim()) return;

    // Stop any ongoing speech or listening
    if (speechSynthesisRef.current?.speaking) {
      speechSynthesisRef.current.cancel();
    }
    stopListening();

    setIsSpeaking(true);

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure voice settings
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find a pleasant voice
      const voices = speechSynthesisRef.current.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Female") ||
          voice.name.includes("female") ||
          voice.lang.includes("en-US")
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setTimeout(() => {
          if (!isListening) startListening();
        }, 500);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        setTimeout(() => {
          if (!isListening) startListening();
        }, 300);
      };

      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error("Error with Web Speech TTS:", error);
      setIsSpeaking(false);
      setTimeout(() => {
        if (!isListening) startListening();
      }, 300);
    }
  }

  function startListening() {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  }

  function stopListening() {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  async function sendMessage(message) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setChat((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);

      const data = await res.json();
      console.log(data.userData);
      setUserData(data.userData);
      const assistantResponse =
        data.response || "Sorry, I couldn't generate a response.";

      setChat((prev) => [
        ...prev,
        { role: "assistant", content: assistantResponse },
      ]);

      // Use Web Speech API for TTS
      speakWithWebSpeech(assistantResponse);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = "Oops, something went wrong. Let's try that again!";
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
      speakWithWebSpeech(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading || isSpeaking) return;
    sendMessage(input.trim());
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        // Stop any ongoing speech
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      startListening();
    }
  }

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleUserData = async () => {
    try {
      const res = await axios.post("/api/sample-save", { userData });

      if (res.status === 200) {
        console.log("user data saved successfully to the database...!");
      }
    } catch (error) {
      console.log("Error while saving data to database...!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br items-center justify-center from-blue-50 to-green-50 p-4 md:p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Vein Coach</h1>
        <p className="text-blue-600">Your personalized AI health assistant</p>
      </header>

      <div className="flex-1 overflow-y-auto rounded-xl w-1/2 bg-white shadow-lg p-4 mb-4">
        {chat.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to HealthFit Coach!
            </h2>
            <p className="text-gray-500 max-w-md">
              I'm here to help you with your fitness goals. Ask me anything
              about nutrition, workouts, or general health advice.
            </p>
            <button
              onClick={() => startListening()}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Start Speaking
            </button>
          </div>
        ) : (
          chat.map((msg, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={messageVariants}
              transition={{ duration: 0.3 }}
              className={`mb-4 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-center mb-1">
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <strong className="text-sm">
                    {msg.role === "user" ? "You" : ""}
                  </strong>
                </div>
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} className="mb-0">
                    {line || "\u00A0"}
                  </p>
                ))}
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%]">
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
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl w-1/2 shadow-lg p-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? "Listening..."
              : isSpeaking
              ? "Coach is speaking..."
              : "Type your health question..."
          }
          disabled={loading || isSpeaking}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />
        <button
          type="button"
          onClick={toggleListening}
          disabled={loading || isSpeaking}
          className={`p-3 rounded-full transition-colors ${
            isListening
              ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          } ${loading || isSpeaking ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
        <button
          type="submit"
          disabled={loading || isSpeaking || isListening || !input.trim()}
          className="px-5 py-3 bg-green-600 text-white rounded-full font-medium hover:enabled:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Send
        </button>
        <button
          onClick={handleUserData}
          disabled={loading || isSpeaking || isListening}
          className="px-5 py-3 bg-green-600 text-white rounded-full font-medium hover:enabled:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

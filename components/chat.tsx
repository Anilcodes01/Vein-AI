'use client'
import { useState, useEffect } from 'react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [animationProgress, setAnimationProgress] = useState(0);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');
    setAnimationProgress(0);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let newMessage = '';

    // Add bot message placeholder
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    // Start animation interval
    const animationInterval = setInterval(() => {
      setAnimationProgress(prev => (prev + 10) % 100);
    }, 100);

    try {
      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        newMessage += decoder.decode(value);

        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = { role: "bot", text: newMessage };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      clearInterval(animationInterval);
      setIsLoading(false);
      setAnimationProgress(0);
    }
  };

  return (
    <div className="h-[60%] w-full flex flex-col p-6 ">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`
              p-2 rounded 
              ${msg.role === "user" 
                ? "bg-blue-100 text-blue-800 self-end" 
                : "bg-green-100 text-green-800 self-start"}
            `}
          >
            {msg.role === "user" ? `You: ${msg.text}` : `Gemini: ${msg.text}`}
          </div>
        ))}
        
        {isLoading && (
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-200 ease-out" 
              style={{
                width: '20%',
                transform: `translateX(${animationProgress * 5}%)`,
                animation: 'pulse 1.5s infinite'
              }}
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Send'}
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}


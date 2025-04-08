"use client";

import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
 
  const sessionId = "default";

  async function sendMessage(message: any) {

    setChat((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, message }),
      });

      const data = await res.json();
 
      setChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oops, something went wrong. My circuits are a bit tangled right now!",
        },
      ]);
    }
    setLoading(false);
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  }

  return (
    <div className="chat-container">
      <h1>Fitness Onboarding Assistant</h1>
      <div className="chat-window">
        {chat.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <p className="typing">Assistant is typing...</p>}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
      <style jsx>{`
        .chat-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #fafafa;
          font-family: Arial, sans-serif;
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        .chat-window {
          height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 20px;
          background: #fff;
          border-radius: 4px;
        }
        .chat-message {
          margin-bottom: 15px;
          padding: 8px;
          border-radius: 4px;
        }
        .chat-message.user {
          background: #e0f7fa;
          text-align: right;
        }
        .chat-message.assistant {
          background: #fff9c4;
          text-align: left;
        }
        .typing {
          font-style: italic;
          color: #888;
        }
        .chat-form {
          display: flex;
          gap: 10px;
        }
        .chat-form input {
          flex: 1;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .chat-form button {
          padding: 10px 20px;
          font-size: 16px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .chat-form button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

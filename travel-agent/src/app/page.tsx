"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";

export default function Home() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">🌍 Travel Advisor</h1>
        <p className="text-gray-400 text-sm">
          AI-powered trip planning with real flights, hotels &amp; activities
        </p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="text-6xl">✈️</div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Plan your dream trip
              </h2>
              <p className="text-gray-400 max-w-md">
                Tell me where you want to go, your budget, and what you like to
                do. I&apos;ll search for real flights, hotels, and activities.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                "Plan a 3-day trip to Barcelona from NYC for $2000, I like hiking and seafood",
                "Week in Tokyo, $3000 budget, anime and street food",
                "Cheap weekend getaway from Chicago under $500",
              ].map((example) => (
                <button
                  key={example}
                  className="text-sm bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 text-gray-300 transition-colors text-left"
                  onClick={() => setInput(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm [&_a]:text-blue-400 [&_a]:underline">
                {m.parts
                  .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
                  .map((p, i) => (
                    <span key={i}>{p.text}</span>
                  ))}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-white rounded-full"></div>
                Searching for the best options...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Where do you want to go?"
            className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl px-6 py-3 font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

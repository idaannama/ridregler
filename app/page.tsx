"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, Persona } from "@/types/chat";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import HorseBackground from "@/components/HorseBackground";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(question: string) {
    if (!question.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: messages.map(({ role, content }) => ({ role, content })),
          persona,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <HorseBackground />
    <main className="flex flex-col h-screen max-w-2xl mx-auto px-4">
      <header className="py-5 border-b text-center">
        <h1 className="text-5xl font-bold text-gray-800" style={{ fontFamily: "var(--font-dancing)" }}>
          tävlingsfasit delux
        </h1>
        <p className="text-xs text-gray-400 mt-1 tracking-widest uppercase">– det ultimata TR-verktyget –</p>
      </header>
      <div className="flex-1 overflow-y-auto pb-36">
        <MessageList messages={messages} loading={loading} persona={persona} />
        {error && <p className="text-red-500 text-sm px-1 py-1">{error}</p>}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSubmit={handleSubmit} disabled={loading} persona={persona} onPersonaChange={setPersona} />
    </main>
    </>
  );
}

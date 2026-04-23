"use client";

import { useState } from "react";
import type { Message, Persona } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import TomteLoader from "./TomteLoader";

const QUESTION_POOL: Record<NonNullable<Persona> | "default", string[]> = {
  default: [
    "Vilka betsel är tillåtna i dressyr?",
    "Vad gäller för sporrar i hopp?",
    "Hur länge får man värma upp hästen?",
    "Vad händer om man rider fel program?",
    "Får man använda piska i dressyr?",
    "Vad är reglerna för hästens ålder vid tävling?",
    "Hur fungerar en omstart vid vägran?",
    "Vilka skydd är tillåtna i hoppning?",
    "Vad gäller för ryttarens klädsel?",
    "Hur lämnar man in en protest?",
  ],
  dressyr: [
    "Vilka betsel är tillåtna i dressyr?",
    "Får man rida med dubbeltygel på lätt klass?",
    "Vad är reglerna för sporrar i dressyr?",
    "Vad gäller för bandage i dressyr?",
    "Hur bedöms ett felridt program?",
    "Vad händer om hästen visar otypiska rörelser?",
    "Får man ha sadeltäcke i dressyrringen?",
    "Vilka hjälpmedel är förbjudna i dressyr?",
  ],
  hopp: [
    "Vad gäller för sporrar i hopp?",
    "Hur många startförsök får man?",
    "Vad räknas som vägran?",
    "Vilka betsel är tillåtna i hoppning?",
    "Hur beräknas straftiden?",
    "Vad gäller vid en fallolycka?",
    "Får man rida om ett hinder man har rivit?",
    "Vad gäller för rid-in-tid i hoppning?",
  ],
  hast: [
    "Vad tycker du om bett?",
    "Hur länge får man värma upp mig?",
    "Vad är reglerna för piskor?",
    "Får man ha skydd på mig i dressyr?",
    "Vad säger reglerna om hästens välmående?",
    "Hur ska sadeln sitta enligt reglementet?",
    "Vad händer om jag vägrar ett hinder?",
    "Vilka medicinska kontroller görs vid tävling?",
  ],
  domare: [
    "Vad leder till diskvalificering?",
    "Hur bedöms ett felridt program?",
    "Vad gäller vid otillåten utrustning?",
    "Vilka protester kan lämnas in?",
    "Hur hanteras en olycka under tävling?",
    "Vad gäller vid sen ankomst till start?",
    "När kan en domare avbryta ett ekipage?",
    "Vad innebär en officiell varning?",
  ],
};

function pickRandom(pool: string[], count: number, seed: number): string[] {
  const copy = [...pool];
  const offset = seed % copy.length;
  const rotated = [...copy.slice(offset), ...copy.slice(0, offset)];
  return rotated.slice(0, count);
}

interface Props {
  messages: Message[];
  loading: boolean;
  persona: Persona;
  onQuickQuestion: (q: string) => void;
  suggestedQuestions: string[];
}

export default function MessageList({ messages, loading, persona, onQuickQuestion, suggestedQuestions }: Props) {
  const pool = QUESTION_POOL[persona ?? "default"];
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * pool.length));
  const fallbackQuestions = pickRandom(pool, 4, seed);

  const lastIsAssistant =
    !loading && messages.length > 0 && messages[messages.length - 1].role === "assistant";

  const questionsToShow = suggestedQuestions.length > 0 ? suggestedQuestions : fallbackQuestions;
  const canShuffle = suggestedQuestions.length === 0;

  return (
    <div className="pt-2 pb-4 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-6">
          Ställ en fråga om tävlingsreglementet (TR).
        </p>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {loading && <TomteLoader persona={persona} />}
      {lastIsAssistant && (
        <div className="flex justify-end flex-wrap gap-3 px-1 items-center">
          {questionsToShow.map((q) => (
            <button
              key={q}
              onClick={() => onQuickQuestion(q)}
              className="px-3 py-1 text-xs rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {q}
            </button>
          ))}
          {canShuffle && (
            <button
              onClick={() => setSeed(Math.floor(Math.random() * pool.length))}
              title="Nya förslag"
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

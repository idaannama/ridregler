"use client";

import { useState, KeyboardEvent } from "react";
import type { Persona } from "@/types/chat";

interface Props {
  onSubmit: (question: string) => void;
  disabled: boolean;
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
}

const PERSONAS: { id: Persona; label: string; color: string; activeColor: string }[] = [
  {
    id: "dressyr",
    label: "Dressyr tanten",
    color: "border-purple-400 text-purple-700 hover:bg-purple-50",
    activeColor: "bg-purple-500 border-purple-500 text-white",
  },
  {
    id: "hopp",
    label: "Hopp killen",
    color: "border-green-400 text-green-700 hover:bg-green-50",
    activeColor: "bg-green-500 border-green-500 text-white",
  },
  {
    id: "hast",
    label: "Hästen",
    color: "border-amber-500 text-amber-700 hover:bg-amber-50",
    activeColor: "bg-amber-500 border-amber-500 text-white",
  },
  {
    id: "domare",
    label: "Domaren",
    color: "border-slate-500 text-slate-700 hover:bg-slate-50",
    activeColor: "bg-slate-700 border-slate-700 text-white",
  },
];

export default function ChatInput({ onSubmit, disabled, persona, onPersonaChange }: Props) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function togglePersona(id: Persona) {
    onPersonaChange(persona === id ? null : id);
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 bg-white border-t pt-2 pb-4">
      <div className="flex gap-2 mb-2 flex-wrap">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => togglePersona(p.id)}
            disabled={disabled}
            className={`px-2 py-0.5 text-[10px] rounded-full border font-medium transition-colors disabled:opacity-50 ${
              persona === p.id ? p.activeColor : p.color
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 resize-none border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Skriv din fråga om TR… (Enter för att skicka)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}

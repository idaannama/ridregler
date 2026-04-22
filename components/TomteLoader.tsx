"use client";

import { useState, useEffect } from "react";
import type { Persona } from "@/types/chat";

const phrasesByPersona: Record<string, string[]> = {
  hast: [
    "Hmm...",
    "Jag minns något om detta.",
    "Vänta lite.",
    "Ja, det vet jag.",
    "Jag har sett det här förut.",
    "Det här vet jag faktiskt.",
    "Låt mig tänka en sekund.",
  ],
  dressyr: [
    "Åh, du vet inte det?",
    "Typiskt. Vänta.",
    "Jag suckar, men okej.",
    "Det borde du ha läst sedan länge.",
    "Naturligtvis vet jag svaret.",
  ],
  hopp: [
    "Eh... jag vet det...",
    "Vänta, det är i TR nånstans.",
    "Det är lugnt, jag hittar det.",
    "Mmm...",
    "Typ paragraf nåt...",
  ],
  default: [
    "Letar i regelböckerna...",
    "Bläddrar igenom TR...",
    "Söker rätt paragraf...",
    "Hämtar svaret...",
    "Kollar tävlingsreglementet...",
  ],
};

interface Props {
  persona: Persona;
}

export default function TomteLoader({ persona }: Props) {
  const key = persona ?? "default";
  const phrases = phrasesByPersona[key] ?? phrasesByPersona.default;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 350);
    }, 2000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-2 py-2 px-4">
        <div
          className="relative flex flex-col items-center"
          style={{ marginTop: "2.5rem" }}
        >
          {/* Speech bubble */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.35s ease",
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "white",
              border: "1.5px solid #e5e7eb",
              borderRadius: "14px",
              padding: "6px 14px",
              fontSize: "0.8rem",
              color: "#374151",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 1,
            }}
          >
            {phrases[index]}
            <span
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid #e5e7eb",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "7px solid white",
              }}
            />
          </div>

          <img
            src="/srf-horse-talking.svg"
            alt=""
            className="select-none"
            style={{ width: "4rem", height: "auto" }}
          />
          <div className="w-10 h-2 bg-gray-400 rounded-full blur-sm opacity-20" />
        </div>
      </div>
    </div>
  );
}

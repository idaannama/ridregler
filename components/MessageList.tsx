import type { Message, Persona } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import TomteLoader from "./TomteLoader";

interface Props {
  messages: Message[];
  loading: boolean;
  persona: Persona;
}

export default function MessageList({ messages, loading, persona }: Props) {
  return (
    <div className="py-4 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-6">
          Ställ en fråga om tävlingsreglementet (TR).
        </p>
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {loading && <TomteLoader persona={persona} />}
    </div>
  );
}

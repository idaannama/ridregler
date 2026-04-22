export type Role = "user" | "assistant";
export type Persona = "dressyr" | "hopp" | "hast" | null;

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface AskRequest {
  question: string;
  history?: { role: Role; content: string }[];
  persona?: Persona;
}

export interface AskResponse {
  answer: string;
}

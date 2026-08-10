export interface ChatLog {
  id: string;
  question: string;
  answer: string;
  botAnswered: boolean;
  createdAt: string;
}

export interface ChatCustomAnswer {
  id: string;
  question: string;
  doctorAnswer: string | null;
  status: "pending" | "answered" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

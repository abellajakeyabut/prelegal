export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'll help you put together a Mutual NDA. To start, who are the two parties? " +
    "Tell me each company's name, and who will sign for it.",
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const { role, content } = value as Record<string, unknown>;
  return (role === "user" || role === "assistant") && typeof content === "string";
}

/** A saved conversation, or a fresh one with just the greeting if missing or malformed. */
export function parseChat(raw: string | null): ChatMessage[] {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (Array.isArray(value) && value.length > 0 && value.every(isChatMessage)) return value;
  } catch {
    // Malformed JSON falls through to a fresh conversation.
  }
  return [GREETING];
}

"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import type { ChatMessage } from "@/lib/nda/chat";

interface Props {
  messages: ChatMessage[];
  pending: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onRetry: () => void;
}

/** The conversation with the AI assistant that fills in the NDA. */
export function NdaChat({ messages, pending, error, onSend, onRetry }: Props) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, pending, error]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    onSend(text);
    setDraft("");
  };

  // Enter sends; Shift+Enter adds a new line.
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) submit(event);
  };

  return (
    <div className="flex h-[32rem] flex-col rounded-lg border border-zinc-200 bg-white lg:h-[calc(100vh-14rem)] dark:border-zinc-800 dark:bg-zinc-900">
      <ol aria-label="Conversation" aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <li
            key={index}
            className={
              message.role === "user"
                ? "max-w-[85%] self-end whitespace-pre-wrap rounded-lg bg-brand-blue px-3 py-2 text-sm text-white"
                : "max-w-[85%] self-start whitespace-pre-wrap rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800"
            }
          >
            {message.content}
          </li>
        ))}
        {pending && <li className="self-start text-sm text-zinc-500">Assistant is typing…</li>}
        {error && (
          <li role="alert" className="self-start text-sm text-red-600 dark:text-red-400">
            {error}{" "}
            <button type="button" onClick={onRetry} className="font-medium underline">
              Retry
            </button>
          </li>
        )}
        <li ref={endRef} aria-hidden="true" />
      </ol>

      <form onSubmit={submit} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Type your answer…"
          aria-label="Message"
          className="flex-1 resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="self-end rounded-md bg-brand-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

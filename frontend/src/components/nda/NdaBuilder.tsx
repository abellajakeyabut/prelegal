"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { apiFetch } from "@/lib/api";
import { GREETING, parseChat, type ChatMessage } from "@/lib/nda/chat";
import { parseDraft } from "@/lib/nda/draft";
import { missingFieldLabels } from "@/lib/nda/missing";
import { renderNda } from "@/lib/nda/render";
import { normalizeState } from "@/lib/nda/states";
import { createDefaultNdaData, type NdaFormData } from "@/lib/nda/types";
import { validateNda } from "@/lib/nda/validate";

import { DownloadButtons } from "./DownloadButtons";
import { NdaChat } from "./NdaChat";
import { NdaPreview } from "./NdaPreview";

const STORAGE_KEY = "prelegal.nda.v1";
const CHAT_STORAGE_KEY = "prelegal.nda.chat.v1";

interface Props {
  coverTemplate: string;
  termsTemplate: string;
}

interface ChatResponse {
  reply: string;
  fields: NdaFormData;
}

function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Reads localStorage, which can throw (e.g. blocked site data). */
function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota): the draft just isn't saved.
  }
}

/** Saved draft merged over fresh defaults, so older/partial drafts still load. */
function loadInitialData(): NdaFormData {
  return parseDraft(readStorage(STORAGE_KEY), createDefaultNdaData(todayIso()));
}

function loadInitialChat(): ChatMessage[] {
  return parseChat(readStorage(CHAT_STORAGE_KEY));
}

const subscribeNoop = () => () => {};

/**
 * The builder depends on the browser (today's date, saved draft and chat), so
 * it is only rendered after hydration; the server sends a lightweight placeholder.
 */
export function NdaBuilder(props: Props) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  if (!isClient) {
    return <p className="text-sm text-zinc-500">Loading NDA builder…</p>;
  }
  return <NdaBuilderClient {...props} />;
}

function NdaBuilderClient({ coverTemplate, termsTemplate }: Props) {
  const [data, setData] = useState<NdaFormData>(loadInitialData);
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialChat);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => writeStorage(STORAGE_KEY, data), [data]);
  useEffect(() => writeStorage(CHAT_STORAGE_KEY, messages), [messages]);

  const markdown = useMemo(
    () => renderNda(coverTemplate, termsTemplate, data),
    [coverTemplate, termsTemplate, data],
  );
  const missing = useMemo(() => missingFieldLabels(validateNda(data)), [data]);

  /** Sends the conversation so far; the reply and updated fields replace the old ones. */
  const askAssistant = async (conversation: ChatMessage[]) => {
    setPending(true);
    setError(null);
    try {
      const response = await apiFetch<ChatResponse>("/chat", {
        method: "POST",
        body: JSON.stringify({ messages: conversation, fields: data }),
      });
      const fields = response.fields;
      setData({ ...fields, governingLaw: normalizeState(fields.governingLaw) });
      setMessages([...conversation, { role: "assistant", content: response.reply }]);
    } catch {
      setError("The assistant couldn't reply.");
    } finally {
      setPending(false);
    }
  };

  const send = (text: string) => {
    const conversation: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(conversation);
    void askAssistant(conversation);
  };

  const reset = () => {
    setData(createDefaultNdaData(todayIso()));
    setMessages([GREETING]);
    setError(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] print:block">
      <section aria-label="Chat with the assistant" className="flex flex-col gap-4 print:hidden">
        <NdaChat
          messages={messages}
          pending={pending}
          error={error}
          onSend={send}
          onRetry={() => void askAssistant(messages)}
        />
        <DownloadButtons
          markdown={markdown}
          data={data}
          missing={missing}
          resetDisabled={pending}
          onReset={reset}
        />
      </section>
      <section aria-label="NDA preview" className="lg:sticky lg:top-6 lg:self-start">
        <NdaPreview markdown={markdown} />
      </section>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { parseDraft } from "@/lib/nda/draft";
import { renderNda } from "@/lib/nda/render";
import { createDefaultNdaData, type NdaFormData } from "@/lib/nda/types";
import { validateNda } from "@/lib/nda/validate";

import { DownloadButtons } from "./DownloadButtons";
import { NdaForm } from "./NdaForm";
import { NdaPreview } from "./NdaPreview";

const STORAGE_KEY = "prelegal.nda.v1";

interface Props {
  coverTemplate: string;
  termsTemplate: string;
}

function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Saved draft merged over fresh defaults, so older/partial drafts still load. */
function loadInitialData(): NdaFormData {
  const defaults = createDefaultNdaData(todayIso());
  try {
    return parseDraft(window.localStorage.getItem(STORAGE_KEY), defaults);
  } catch {
    return defaults; // Storage access itself can throw (e.g. blocked site data).
  }
}

const subscribeNoop = () => () => {};

/**
 * The form depends on the browser (today's date, saved draft), so it is only
 * rendered after hydration; the server sends a lightweight placeholder.
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
  // Set when a download is attempted on an incomplete form: show every error.
  const [revealErrors, setRevealErrors] = useState(false);
  // Bumped on Reset to remount the form, clearing its "touched" state.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable (private mode, quota): the draft just isn't saved.
    }
  }, [data]);

  const markdown = useMemo(
    () => renderNda(coverTemplate, termsTemplate, data),
    [coverTemplate, termsTemplate, data],
  );
  const errors = useMemo(() => validateNda(data), [data]);
  const isValid = Object.keys(errors).length === 0;

  const reset = () => {
    setData(createDefaultNdaData(todayIso()));
    setRevealErrors(false);
    setFormKey((key) => key + 1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] print:block">
      <section aria-label="NDA details" className="flex flex-col gap-4 print:hidden">
        <NdaForm
          key={formKey}
          data={data}
          errors={errors}
          revealAll={revealErrors}
          onChange={setData}
        />
        <DownloadButtons
          markdown={markdown}
          data={data}
          isValid={isValid}
          onInvalidAttempt={() => setRevealErrors(true)}
          onReset={reset}
        />
      </section>
      <section aria-label="NDA preview" className="lg:sticky lg:top-6 lg:self-start">
        <NdaPreview markdown={markdown} />
      </section>
    </div>
  );
}

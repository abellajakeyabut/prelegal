import type { NdaFormData } from "@/lib/nda/types";

interface Props {
  markdown: string;
  data: NdaFormData;
  isValid: boolean;
  /** Called when a download is clicked while the form is incomplete. */
  onInvalidAttempt: () => void;
  onReset: () => void;
}

function slug(text: string): string {
  return text
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileName(data: NdaFormData): string {
  const parts = [slug(data.party1.company), slug(data.party2.company)].filter(Boolean);
  return ["Mutual-NDA", ...parts].join("-");
}

function downloadMarkdown(markdown: string, name: string) {
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.md`;
  link.click();
  // Revoke after the click has been handled so the download isn't cancelled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Uses the browser's print dialog ("Save as PDF"); print CSS hides the form. */
function printPdf(name: string) {
  const previousTitle = document.title;
  document.title = name; // Browsers use the title as the default PDF file name.
  window.addEventListener("afterprint", () => (document.title = previousTitle), {
    once: true,
  });
  window.print();
}

// `aria-disabled` (not `disabled`) so a click on an incomplete form still
// fires and can reveal what's missing.
const disabledStyle = "aria-disabled:cursor-not-allowed aria-disabled:opacity-40";
const primary = `rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 ${disabledStyle}`;
const secondary = `rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 ${disabledStyle}`;

export function DownloadButtons({ markdown, data, isValid, onInvalidAttempt, onReset }: Props) {
  const name = fileName(data);
  const guarded = (action: () => void) => () => (isValid ? action() : onInvalidAttempt());
  const confirmReset = () => {
    if (window.confirm("Clear all fields and start over?")) onReset();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primary}
          aria-disabled={!isValid}
          onClick={guarded(() => printPdf(name))}
        >
          Download PDF
        </button>
        <button
          type="button"
          className={secondary}
          aria-disabled={!isValid}
          onClick={guarded(() => downloadMarkdown(markdown, name))}
        >
          Download .md
        </button>
        <button type="button" className={`${secondary} ml-auto`} onClick={confirmReset}>
          Reset
        </button>
      </div>
      <p className="text-xs text-zinc-500" aria-live="polite">
        {isValid
          ? "PDF opens your browser's print dialog — choose “Save as PDF”."
          : "Complete the required fields to download. Missing values are highlighted in the preview."}
      </p>
    </div>
  );
}

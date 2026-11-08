import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Inline code only appears in the rendered NDA as a `[Missing field]` marker
 * (user input is escaped), so render it as a highlight rather than code.
 */
const components: Components = {
  code: ({ children }) => <mark className="nda-missing">{children}</mark>,
};

export function NdaPreview({ markdown }: { markdown: string }) {
  return (
    <article
      aria-label="Mutual NDA preview"
      className="nda-doc rounded-lg border border-zinc-200 bg-white px-6 py-8 text-zinc-900 shadow-sm sm:px-10 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto print:max-h-none print:overflow-visible print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
    </article>
  );
}

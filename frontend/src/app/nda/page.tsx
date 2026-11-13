import type { Metadata } from "next";
import Link from "next/link";

import { RequireLogin } from "@/components/auth/RequireLogin";
import { UserMenu } from "@/components/auth/UserMenu";
import { NdaBuilder } from "@/components/nda/NdaBuilder";
import { loadNdaTemplates } from "@/lib/nda/templates";

export const metadata: Metadata = {
  title: "Mutual NDA Creator · Prelegal",
  description:
    "Fill in the key terms and download a completed Common Paper Mutual NDA.",
};

export default async function NdaPage() {
  const { cover, terms } = await loadNdaTemplates();

  return (
    <RequireLogin>
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900 print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <h1 className="text-lg font-semibold">Mutual NDA Creator</h1>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
                Prelegal
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 print:max-w-none print:p-0">
          <NdaBuilder coverTemplate={cover} termsTemplate={terms} />
        </main>

        <footer className="border-t border-zinc-200 px-4 py-4 text-xs text-zinc-500 sm:px-8 dark:border-zinc-800 print:hidden">
          <p className="mx-auto max-w-7xl">
            Not legal advice. Based on the{" "}
            <a
              href="https://commonpaper.com/standards/mutual-nda/1.0"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Common Paper Mutual NDA v1.0
            </a>
            , used under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 4.0
            </a>
            . Have a lawyer review any agreement before signing.
          </p>
        </footer>
      </div>
    </RequireLogin>
  );
}

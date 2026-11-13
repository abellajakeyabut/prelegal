import Link from "next/link";

import { RequireLogin } from "@/components/auth/RequireLogin";
import { UserMenu } from "@/components/auth/UserMenu";

export default function Home() {
  return (
    <RequireLogin>
      <header className="flex justify-end px-4 py-4 sm:px-8">
        <UserMenu />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Prelegal</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Draft common legal agreements from standard, CC BY 4.0 licensed templates.
        </p>
        <Link
          href="/nda"
          className="self-start rounded-md bg-zinc-900 px-5 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Create a Mutual NDA →
        </Link>
      </main>
    </RequireLogin>
  );
}

import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in · Prelegal",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-navy dark:text-white">
          Prelegal
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">Log in to draft your agreements.</p>
      </div>
      <LoginForm />
    </main>
  );
}

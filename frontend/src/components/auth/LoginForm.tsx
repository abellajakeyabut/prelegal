"use client";

import { useRouter } from "next/navigation";
import { useEffect, type FormEvent } from "react";

import { login } from "@/lib/session";
import { useUser } from "@/lib/useUser";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

/** Fake login: any email and password are accepted. */
export function LoginForm() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(String(new FormData(event.currentTarget).get("email")));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-brand-blue px-5 py-2.5 font-medium text-white hover:bg-brand-navy"
      >
        Log in
      </button>
      <p className="text-xs text-brand-gray">Demo login: any email and password will work.</p>
    </form>
  );
}

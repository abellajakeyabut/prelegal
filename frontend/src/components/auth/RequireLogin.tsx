"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useUser } from "@/lib/useUser";

/** Renders its children only for a logged-in user; sends everyone else to /login. */
export function RequireLogin({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login/");
  }, [user, router]);

  if (!user) {
    return <p className="px-4 py-16 text-center text-sm text-zinc-500">Loading…</p>;
  }
  return children;
}

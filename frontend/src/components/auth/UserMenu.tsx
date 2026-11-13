"use client";

import { useRouter } from "next/navigation";

import { logout } from "@/lib/session";
import { useUser } from "@/lib/useUser";

/** Signed-in email with a Log out button, for page headers. */
export function UserMenu() {
  const user = useUser();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.replace("/login/");
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{user.email}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Log out
      </button>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

import { parseUser, readSession, subscribeSession, type User } from "./session";

/**
 * The logged-in user, or null when logged out. Undefined during prerender and
 * hydration, when localStorage cannot be read yet.
 */
export function useUser(): User | null | undefined {
  // Snapshot the raw string: it is stable between reads, unlike a parsed object.
  const raw = useSyncExternalStore(subscribeSession, readSession, () => undefined);
  return raw === undefined ? undefined : parseUser(raw);
}

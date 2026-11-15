/**
 * Fake login for the V1 foundation: no authentication, the "signed in" user is
 * just an email kept in localStorage.
 */

export interface User {
  email: string;
}

export const SESSION_KEY = "prelegal.user";
const CHANGE_EVENT = "prelegal:session";

/** Parses the stored session value; anything malformed counts as logged out. */
export function parseUser(raw: string | null): User | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { email } = value as { email?: unknown };
    return typeof email === "string" && email.trim() ? { email: email.trim() } : null;
  } catch {
    return null;
  }
}

export function readSession(): string | null {
  return window.localStorage.getItem(SESSION_KEY);
}

export function login(email: string): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ email: email.trim() }));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function logout(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Notifies on login/logout in this tab and on storage changes from other tabs. */
export function subscribeSession(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

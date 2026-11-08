import type { NdaFormData, Party } from "./types";

const ENUM_VALUES: Partial<Record<keyof NdaFormData, readonly string[]>> = {
  mndaTermType: ["fixed", "untilTerminated"],
  confidentialityType: ["fixed", "perpetual"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Copies over only the string fields of `saved` that `defaults` also has. */
function mergeStrings<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [key, fallback] of Object.entries(defaults)) {
    const value = saved[key];
    if (typeof fallback !== "string" || typeof value !== "string") continue;
    const allowed = ENUM_VALUES[key as keyof NdaFormData];
    if (allowed && !allowed.includes(value)) continue;
    result[key] = value;
  }
  return result as T;
}

/**
 * Restores a saved draft (JSON from localStorage) on top of `defaults`.
 * Anything missing, mistyped or unparseable falls back to the default, so a
 * stale or corrupted draft can never crash rendering.
 */
export function parseDraft(raw: string | null, defaults: NdaFormData): NdaFormData {
  if (!raw) return defaults;
  let saved: unknown;
  try {
    saved = JSON.parse(raw);
  } catch {
    return defaults;
  }
  if (!isRecord(saved)) return defaults;
  return {
    ...mergeStrings(defaults, saved),
    party1: mergeStrings<Party>(defaults.party1, saved.party1),
    party2: mergeStrings<Party>(defaults.party2, saved.party2),
  };
}

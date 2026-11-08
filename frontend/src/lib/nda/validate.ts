// Runtime imports in src/lib/nda keep the `.ts` extension: `node --test`
// runs these files directly and doesn't resolve extensionless paths.
// (`import type` lines are erased, so they don't need it.)
import { US_STATES } from "./states.ts";
import type { FieldErrors, NdaFormData, Party, PartyKey } from "./types";

export const MIN_YEARS = 1;
export const MAX_YEARS = 10;

const REQUIRED = "Required";

/** Parses a whole number of years, or returns null if it isn't one. */
export function parseYears(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  return Number(value.trim());
}

function validateYears(value: string): string | undefined {
  const years = parseYears(value);
  if (years === null || years < MIN_YEARS || years > MAX_YEARS) {
    return `Enter a whole number from ${MIN_YEARS} to ${MAX_YEARS}`;
  }
  return undefined;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

const PARTY_FIELDS: (keyof Party)[] = [
  "name",
  "title",
  "company",
  "noticeAddress",
];

/** Returns an error message per invalid field; an empty object means valid. */
export function validateNda(data: NdaFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.purpose.trim()) errors.purpose = REQUIRED;

  if (!data.effectiveDate) errors.effectiveDate = REQUIRED;
  else if (!isValidIsoDate(data.effectiveDate)) {
    errors.effectiveDate = "Enter a valid date";
  }

  if (data.mndaTermType === "fixed") {
    errors.mndaTermYears = validateYears(data.mndaTermYears);
  }
  if (data.confidentialityType === "fixed") {
    errors.confidentialityYears = validateYears(data.confidentialityYears);
  }

  if (!data.governingLaw) errors.governingLaw = REQUIRED;
  else if (!(US_STATES as readonly string[]).includes(data.governingLaw)) {
    errors.governingLaw = "Choose a US state";
  }

  if (!data.jurisdiction.trim()) errors.jurisdiction = REQUIRED;

  for (const partyKey of ["party1", "party2"] as PartyKey[]) {
    for (const field of PARTY_FIELDS) {
      if (!data[partyKey][field].trim()) {
        errors[`${partyKey}.${field}`] = REQUIRED;
      }
    }
  }

  // Drop keys whose validator returned undefined.
  for (const key of Object.keys(errors) as (keyof FieldErrors)[]) {
    if (errors[key] === undefined) delete errors[key];
  }
  return errors;
}

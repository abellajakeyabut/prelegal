import type { FieldErrors, FieldPath } from "./types";

const FIELD_LABELS: Record<FieldPath, string> = {
  purpose: "Purpose",
  effectiveDate: "Effective Date",
  mndaTermType: "MNDA Term",
  mndaTermYears: "MNDA Term years",
  confidentialityType: "Term of Confidentiality",
  confidentialityYears: "Term of Confidentiality years",
  governingLaw: "Governing Law",
  jurisdiction: "Jurisdiction",
  modifications: "Modifications",
  "party1.name": "Party 1 name",
  "party1.title": "Party 1 title",
  "party1.company": "Party 1 company",
  "party1.noticeAddress": "Party 1 notice address",
  "party2.name": "Party 2 name",
  "party2.title": "Party 2 title",
  "party2.company": "Party 2 company",
  "party2.noticeAddress": "Party 2 notice address",
};

/** Human-readable names of the fields that still fail validation, in form order. */
export function missingFieldLabels(errors: FieldErrors): string[] {
  return (Object.keys(FIELD_LABELS) as FieldPath[])
    .filter((path) => errors[path])
    .map((path) => FIELD_LABELS[path]);
}

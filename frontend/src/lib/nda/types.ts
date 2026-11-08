export type MndaTermType = "fixed" | "untilTerminated";
export type ConfidentialityType = "fixed" | "perpetual";

export interface Party {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

/** Everything the user fills in on the MNDA Cover Page. */
export interface NdaFormData {
  purpose: string;
  /** ISO date, `YYYY-MM-DD`. */
  effectiveDate: string;
  mndaTermType: MndaTermType;
  /** Kept as a string so the number input can be cleared while typing. */
  mndaTermYears: string;
  confidentialityType: ConfidentialityType;
  confidentialityYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: Party;
  party2: Party;
}

export type PartyKey = "party1" | "party2";

export type FieldPath =
  | Exclude<keyof NdaFormData, PartyKey>
  | `${PartyKey}.${keyof Party}`;

export type FieldErrors = Partial<Record<FieldPath, string>>;

export const DEFAULT_PURPOSE =
  "Evaluating whether to enter into a business relationship with the other party.";

const emptyParty = (): Party => ({
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
});

/** Defaults mirror the pre-selected options in the Common Paper Cover Page. */
export function createDefaultNdaData(today: string): NdaFormData {
  return {
    purpose: DEFAULT_PURPOSE,
    effectiveDate: today,
    mndaTermType: "fixed",
    mndaTermYears: "1",
    confidentialityType: "fixed",
    confidentialityYears: "1",
    governingLaw: "",
    jurisdiction: "",
    modifications: "",
    party1: emptyParty(),
    party2: emptyParty(),
  };
}

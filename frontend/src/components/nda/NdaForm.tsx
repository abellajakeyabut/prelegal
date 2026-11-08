"use client";

import { useState } from "react";

import { US_STATES } from "@/lib/nda/states";
import type {
  FieldErrors,
  FieldPath,
  NdaFormData,
  Party,
  PartyKey,
} from "@/lib/nda/types";

import { Field, Fieldset, describedBy, inputClass } from "./fields";
import { PartyFields } from "./PartyFields";
import { TermField } from "./TermField";

type TopLevelField = Exclude<keyof NdaFormData, PartyKey>;

interface Props {
  data: NdaFormData;
  errors: FieldErrors;
  /** Show every error, not just those of fields the user has visited. */
  revealAll: boolean;
  onChange: (data: NdaFormData) => void;
}

export function NdaForm({ data, errors, revealAll, onChange }: Props) {
  // Errors appear once a field has been visited (or on a download attempt),
  // not on first load.
  const [touched, setTouched] = useState<ReadonlySet<FieldPath>>(new Set());
  const touch = (path: FieldPath) =>
    setTouched((prev) => (prev.has(path) ? prev : new Set(prev).add(path)));
  const errorFor = (path: FieldPath) =>
    revealAll || touched.has(path) ? errors[path] : undefined;

  const set = <K extends TopLevelField>(key: K, value: NdaFormData[K]) =>
    onChange({ ...data, [key]: value });
  const setParty = (party: PartyKey, field: keyof Party, value: string) =>
    onChange({ ...data, [party]: { ...data[party], [field]: value } });

  /** Props for a plain text-like input bound to a top-level field. */
  const bind = (key: TopLevelField & FieldPath, hint?: string) => ({
    value: data[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
    onBlur: () => touch(key),
    className: inputClass,
    ...describedBy(key, errorFor(key), hint),
  });

  const jurisdictionHint = "e.g. courts located in New Castle, DE";

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={(e) => e.preventDefault()}>
      <Fieldset legend="Agreement">
        <Field
          id="purpose"
          label="Purpose"
          hint="How Confidential Information may be used"
          error={errorFor("purpose")}
        >
          <textarea rows={3} {...bind("purpose", "How Confidential Information may be used")} />
        </Field>
        <Field id="effectiveDate" label="Effective Date" error={errorFor("effectiveDate")}>
          <input type="date" {...bind("effectiveDate")} />
        </Field>
      </Fieldset>

      <Fieldset legend="Terms">
        <TermField
          name="mndaTerm"
          legend="MNDA Term"
          type={data.mndaTermType}
          fixedValue="fixed"
          otherValue="untilTerminated"
          otherLabel="Continues until terminated"
          fixedSuffix="year(s) from Effective Date"
          years={data.mndaTermYears}
          error={errorFor("mndaTermYears")}
          onTypeChange={(v) => set("mndaTermType", v)}
          onYearsChange={(v) => set("mndaTermYears", v)}
          onYearsBlur={() => touch("mndaTermYears")}
        />
        <TermField
          name="confidentiality"
          legend="Term of Confidentiality"
          type={data.confidentialityType}
          fixedValue="fixed"
          otherValue="perpetual"
          otherLabel="In perpetuity"
          fixedSuffix="year(s) from Effective Date (trade secrets protected while they remain trade secrets)"
          years={data.confidentialityYears}
          error={errorFor("confidentialityYears")}
          onTypeChange={(v) => set("confidentialityType", v)}
          onYearsChange={(v) => set("confidentialityYears", v)}
          onYearsBlur={() => touch("confidentialityYears")}
        />
      </Fieldset>

      <Fieldset legend="Governing Law & Jurisdiction">
        <Field id="governingLaw" label="Governing Law (state)" error={errorFor("governingLaw")}>
          <select {...bind("governingLaw")}>
            <option value="">Select a state…</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="jurisdiction"
          label="Jurisdiction"
          hint={jurisdictionHint}
          error={errorFor("jurisdiction")}
        >
          <input type="text" {...bind("jurisdiction", jurisdictionHint)} />
        </Field>
      </Fieldset>

      <Fieldset legend="MNDA Modifications">
        <Field id="modifications" label="Modifications (optional)" hint="Leave blank for none">
          <textarea rows={3} {...bind("modifications", "Leave blank for none")} />
        </Field>
      </Fieldset>

      {(["party1", "party2"] as const).map((party, i) => (
        <PartyFields
          key={party}
          partyKey={party}
          legend={`Party ${i + 1}`}
          party={data[party]}
          errorFor={errorFor}
          onChange={(field, value) => setParty(party, field, value)}
          onBlur={(field) => touch(`${party}.${field}`)}
        />
      ))}
    </form>
  );
}

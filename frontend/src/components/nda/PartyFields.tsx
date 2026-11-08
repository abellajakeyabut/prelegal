import type { FieldPath, Party, PartyKey } from "@/lib/nda/types";

import { Field, Fieldset, describedBy, inputClass } from "./fields";

const FIELDS: { key: keyof Party; label: string; hint?: string; autoComplete: string }[] = [
  { key: "name", label: "Print Name", autoComplete: "name" },
  { key: "title", label: "Title", autoComplete: "organization-title" },
  { key: "company", label: "Company", autoComplete: "organization" },
  {
    key: "noticeAddress",
    label: "Notice Address",
    hint: "Email or postal address",
    autoComplete: "off",
  },
];

interface Props {
  partyKey: PartyKey;
  legend: string;
  party: Party;
  errorFor: (path: FieldPath) => string | undefined;
  onChange: (field: keyof Party, value: string) => void;
  onBlur: (field: keyof Party) => void;
}

export function PartyFields({ partyKey, legend, party, errorFor, onChange, onBlur }: Props) {
  return (
    <Fieldset legend={legend}>
      {FIELDS.map(({ key, label, hint, autoComplete }) => {
        const id = `${partyKey}.${key}` as const;
        const error = errorFor(id);
        return (
          <Field key={key} id={id} label={label} hint={hint} error={error}>
            <input
              type="text"
              autoComplete={autoComplete}
              className={inputClass}
              value={party[key]}
              onChange={(e) => onChange(key, e.target.value)}
              onBlur={() => onBlur(key)}
              {...describedBy(id, error, hint)}
            />
          </Field>
        );
      })}
    </Fieldset>
  );
}

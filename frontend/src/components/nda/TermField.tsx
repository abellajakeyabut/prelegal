import { MAX_YEARS, MIN_YEARS } from "@/lib/nda/validate";

import { describedBy, inputClass } from "./fields";

interface Props<T extends string> {
  name: string;
  legend: string;
  type: T;
  fixedValue: T;
  otherValue: T;
  otherLabel: string;
  fixedSuffix: string;
  years: string;
  error?: string;
  onTypeChange: (type: T) => void;
  onYearsChange: (years: string) => void;
  onYearsBlur: () => void;
}

/** A "N years" vs open-ended radio pair, used for the MNDA and confidentiality terms. */
export function TermField<T extends string>({
  name,
  legend,
  type,
  fixedValue,
  otherValue,
  otherLabel,
  fixedSuffix,
  years,
  error,
  onTypeChange,
  onYearsChange,
  onYearsBlur,
}: Props<T>) {
  const yearsId = `${name}-years`;
  const isFixed = type === fixedValue;

  return (
    <div role="radiogroup" aria-labelledby={`${name}-legend`} className="flex flex-col gap-2">
      <span id={`${name}-legend`} className="text-sm font-medium">
        {legend}
      </span>
      <label className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="radio"
          name={name}
          checked={isFixed}
          onChange={() => onTypeChange(fixedValue)}
        />
        <input
          type="number"
          inputMode="numeric"
          min={MIN_YEARS}
          max={MAX_YEARS}
          step={1}
          aria-label={`${legend} in years`}
          className={`${inputClass} w-20`}
          value={years}
          disabled={!isFixed}
          onChange={(e) => onYearsChange(e.target.value)}
          onBlur={onYearsBlur}
          {...describedBy(yearsId, isFixed ? error : undefined)}
        />
        <span>{fixedSuffix}</span>
      </label>
      {isFixed && error ? (
        <p id={`${yearsId}-error`} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name={name}
          checked={!isFixed}
          onChange={() => onTypeChange(otherValue)}
        />
        {otherLabel}
      </label>
    </div>
  );
}

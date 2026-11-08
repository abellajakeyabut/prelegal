import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDefaultNdaData, type NdaFormData } from "./types.ts";
import { parseYears, validateNda } from "./validate.ts";

const party = {
  name: "Ada Lovelace",
  title: "CEO",
  company: "Engines Inc.",
  noticeAddress: "ada@engines.example",
};

function valid(overrides: Partial<NdaFormData> = {}): NdaFormData {
  return {
    ...createDefaultNdaData("2026-11-08"),
    governingLaw: "Delaware",
    jurisdiction: "courts located in New Castle, DE",
    party1: { ...party },
    party2: { ...party },
    ...overrides,
  };
}

describe("validateNda", () => {
  it("accepts a complete form", () => {
    assert.deepEqual(validateNda(valid()), {});
  });

  it("flags every required field on a blank form", () => {
    const errors = validateNda(createDefaultNdaData(""));
    assert.deepEqual(Object.keys(errors).sort(), [
      "effectiveDate",
      "governingLaw",
      "jurisdiction",
      "party1.company",
      "party1.name",
      "party1.noticeAddress",
      "party1.title",
      "party2.company",
      "party2.name",
      "party2.noticeAddress",
      "party2.title",
    ]);
  });

  it("treats whitespace-only text as missing", () => {
    const errors = validateNda(valid({ purpose: "   " }));
    assert.equal(errors.purpose, "Required");
  });

  it("requires years only for fixed terms", () => {
    assert.ok(validateNda(valid({ mndaTermYears: "" })).mndaTermYears);
    assert.deepEqual(
      validateNda(valid({ mndaTermType: "untilTerminated", mndaTermYears: "" })),
      {},
    );
    assert.ok(validateNda(valid({ confidentialityYears: "0" })).confidentialityYears);
    assert.deepEqual(
      validateNda(valid({ confidentialityType: "perpetual", confidentialityYears: "" })),
      {},
    );
  });

  it("enforces the 1–10 year range and whole numbers", () => {
    assert.ok(validateNda(valid({ mndaTermYears: "11" })).mndaTermYears);
    assert.ok(validateNda(valid({ mndaTermYears: "1.5" })).mndaTermYears);
    assert.equal(validateNda(valid({ mndaTermYears: "10" })).mndaTermYears, undefined);
  });

  it("rejects invalid dates and non-US-state governing law", () => {
    assert.ok(validateNda(valid({ effectiveDate: "2026-02-30" })).effectiveDate);
    assert.ok(validateNda(valid({ governingLaw: "Ontario" })).governingLaw);
  });
});

describe("parseYears", () => {
  it("parses whole numbers only", () => {
    assert.equal(parseYears(" 3 "), 3);
    assert.equal(parseYears("3.0"), null);
    assert.equal(parseYears("-1"), null);
    assert.equal(parseYears(""), null);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseDraft } from "./draft.ts";
import { createDefaultNdaData } from "./types.ts";

const defaults = createDefaultNdaData("2026-11-08");

describe("parseDraft", () => {
  it("returns defaults for missing or invalid JSON", () => {
    assert.deepEqual(parseDraft(null, defaults), defaults);
    assert.deepEqual(parseDraft("{not json", defaults), defaults);
    assert.deepEqual(parseDraft("[1,2]", defaults), defaults);
    assert.deepEqual(parseDraft('"text"', defaults), defaults);
  });

  it("restores valid saved values", () => {
    const saved = {
      ...defaults,
      purpose: "Due diligence",
      mndaTermType: "untilTerminated",
      party1: { ...defaults.party1, company: "Acme" },
    };
    const draft = parseDraft(JSON.stringify(saved), defaults);
    assert.equal(draft.purpose, "Due diligence");
    assert.equal(draft.mndaTermType, "untilTerminated");
    assert.equal(draft.party1.company, "Acme");
  });

  it("drops mistyped, unknown and out-of-range values", () => {
    const draft = parseDraft(
      JSON.stringify({
        purpose: 5,
        governingLaw: null,
        mndaTermType: "forever",
        unknownField: "x",
        party1: "not an object",
        party2: { name: ["x"], title: "CTO" },
      }),
      defaults,
    );
    assert.equal(draft.purpose, defaults.purpose);
    assert.equal(draft.governingLaw, "");
    assert.equal(draft.mndaTermType, "fixed");
    assert.ok(!("unknownField" in draft));
    assert.deepEqual(draft.party1, defaults.party1);
    assert.equal(draft.party2.name, "");
    assert.equal(draft.party2.title, "CTO");
  });
});

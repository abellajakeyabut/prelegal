import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { missingFieldLabels } from "./missing.ts";

describe("missingFieldLabels", () => {
  it("is empty when nothing is missing", () => {
    assert.deepEqual(missingFieldLabels({}), []);
  });

  it("lists labels in form order, not error order", () => {
    const labels = missingFieldLabels({
      "party2.company": "Required",
      governingLaw: "Choose a US state",
      "party1.noticeAddress": "Required",
    });
    assert.deepEqual(labels, ["Governing Law", "Party 1 notice address", "Party 2 company"]);
  });
});

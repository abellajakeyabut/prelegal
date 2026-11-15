import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeState } from "./states.ts";

describe("normalizeState", () => {
  it("fixes case and surrounding spaces", () => {
    assert.equal(normalizeState(" delaware "), "Delaware");
    assert.equal(normalizeState("NEW YORK"), "New York");
    assert.equal(normalizeState("district of columbia"), "District of Columbia");
  });

  it("leaves unknown or empty values unchanged", () => {
    assert.equal(normalizeState("Ontario"), "Ontario");
    assert.equal(normalizeState(""), "");
  });
});

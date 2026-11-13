import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseUser } from "./session.ts";

describe("parseUser", () => {
  it("treats a missing session as logged out", () => {
    assert.equal(parseUser(null), null);
  });

  it("returns the stored user", () => {
    assert.deepEqual(parseUser('{"email":"jane@example.com"}'), { email: "jane@example.com" });
  });

  it("trims the email", () => {
    assert.deepEqual(parseUser('{"email":"  jane@example.com "}'), { email: "jane@example.com" });
  });

  it("rejects malformed or empty sessions", () => {
    assert.equal(parseUser("{not json"), null);
    assert.equal(parseUser("null"), null);
    assert.equal(parseUser('"jane@example.com"'), null);
    assert.equal(parseUser("{}"), null);
    assert.equal(parseUser('{"email":42}'), null);
    assert.equal(parseUser('{"email":"   "}'), null);
  });
});

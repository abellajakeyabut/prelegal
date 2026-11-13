import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GREETING, parseChat } from "./chat.ts";

describe("parseChat", () => {
  it("starts with the greeting when nothing is saved", () => {
    assert.deepEqual(parseChat(null), [GREETING]);
  });

  it("restores a saved conversation", () => {
    const saved = [GREETING, { role: "user", content: "Acme and Globex" }];
    assert.deepEqual(parseChat(JSON.stringify(saved)), saved);
  });

  it("starts over on malformed or empty data", () => {
    assert.deepEqual(parseChat("{not json"), [GREETING]);
    assert.deepEqual(parseChat("[]"), [GREETING]);
    assert.deepEqual(parseChat('{"role":"user"}'), [GREETING]);
    assert.deepEqual(parseChat('[{"role":"system","content":"x"}]'), [GREETING]);
    assert.deepEqual(parseChat('[{"role":"user","content":5}]'), [GREETING]);
  });
});

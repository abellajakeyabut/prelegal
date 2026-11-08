import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  COVER_PLACEHOLDERS,
  escapeMarkdown,
  formatDate,
  renderNda,
  renderStandardTerms,
} from "./render.ts";
import { createDefaultNdaData, type NdaFormData } from "./types.ts";

const readTemplate = (file: string) =>
  readFileSync(new URL(`../../../../templates/${file}`, import.meta.url), "utf8");

const cover = readTemplate("Mutual-NDA-coverpage.md");
const terms = readTemplate("Mutual-NDA.md");

function filledData(overrides: Partial<NdaFormData> = {}): NdaFormData {
  return {
    ...createDefaultNdaData("2026-11-08"),
    purpose: "Exploring a joint venture.",
    governingLaw: "Delaware",
    jurisdiction: "courts located in New Castle, DE",
    modifications: "Section 6 does not apply.",
    party1: {
      name: "Ada Lovelace",
      title: "CEO",
      company: "Analytical Engines Inc.",
      noticeAddress: "ada@engines.example",
    },
    party2: {
      name: "Alan Turing",
      title: "CTO",
      company: "Bombe Ltd",
      noticeAddress: "1 Bletchley Park, UK",
    },
    ...overrides,
  };
}

describe("templates", () => {
  it("contain every placeholder exactly once", () => {
    for (const [key, placeholder] of Object.entries(COVER_PLACEHOLDERS)) {
      assert.equal(cover.split(placeholder).length - 1, 1, `placeholder ${key}`);
    }
  });
});

describe("renderNda", () => {
  const doc = renderNda(cover, terms, filledData());

  it("fills in every value", () => {
    for (const value of [
      "Exploring a joint venture.",
      "November 8, 2026",
      "Governing Law: Delaware",
      "Jurisdiction: courts located in New Castle, DE",
      "Section 6 does not apply.",
      "| Print Name | Ada Lovelace | Alan Turing |",
      "| Title | CEO | CTO |",
      "| Company | Analytical Engines Inc. | Bombe Ltd |",
      "| Notice Address | ada@engines.example | 1 Bletchley Park, UK |",
    ]) {
      assert.ok(doc.includes(value), `missing: ${value}`);
    }
  });

  it("leaves no template placeholders, labels or spans behind", () => {
    for (const placeholder of Object.values(COVER_PLACEHOLDERS)) {
      assert.ok(!doc.includes(placeholder), `left behind: ${placeholder}`);
    }
    assert.ok(!doc.includes("[1 year(s)]"));
    assert.ok(!doc.includes("<label>"));
    assert.ok(!doc.includes("<span"));
  });

  it("leaves no missing-value markers when the form is complete", () => {
    assert.ok(!doc.includes("`["), "found an unfilled `[...]` marker");
  });

  it("keeps the Standard Terms and CC BY 4.0 attribution", () => {
    assert.ok(doc.includes("# Standard Terms"));
    assert.ok(doc.includes("**Purpose**"));
    assert.equal(doc.match(/CC BY 4\.0/g)?.length, 2);
  });

  it("checks only the fixed-term options by default", () => {
    assert.ok(doc.includes("- [x] Expires 1 year from Effective Date."));
    assert.ok(doc.includes("- [ ] Continues until terminated"));
    assert.ok(doc.includes("- [x] 1 year from Effective Date, but"));
    assert.ok(doc.includes("- [ ] In perpetuity."));
  });

  it("supports open-ended and perpetual terms", () => {
    const open = renderNda(
      cover,
      terms,
      filledData({ mndaTermType: "untilTerminated", confidentialityType: "perpetual" }),
    );
    assert.ok(open.includes("- [ ] Expires"));
    assert.ok(open.includes("- [x] Continues until terminated"));
    assert.ok(open.includes("- [ ] 1 year from Effective Date, but"));
    assert.ok(open.includes("- [x] In perpetuity."));
  });

  it("pluralises years", () => {
    const doc3 = renderNda(cover, terms, filledData({ mndaTermYears: "3" }));
    assert.ok(doc3.includes("Expires 3 years from Effective Date."));
  });

  it("writes None. when there are no modifications", () => {
    const none = renderNda(cover, terms, filledData({ modifications: "  " }));
    assert.ok(none.includes("\nNone.\n"));
  });

  it("shows highlighted placeholders for empty fields", () => {
    const empty = renderNda(cover, terms, createDefaultNdaData("2026-11-08"));
    assert.ok(empty.includes("Governing Law: `[Governing Law]`"));
    assert.ok(empty.includes("| Company | `[Company]` | `[Company]` |"));
  });

  it("escapes user input so it cannot break the table or markup", () => {
    const tricky = renderNda(
      cover,
      terms,
      filledData({
        party1: { ...filledData().party1, company: "A|B *Corp*", name: "x\ny" },
      }),
    );
    assert.ok(tricky.includes("| Company | A\\|B \\*Corp\\* | Bombe Ltd |"));
    assert.ok(tricky.includes("| Print Name | x y | Alan Turing |"));
  });
});

describe("helpers", () => {
  it("formatDate has no timezone drift", () => {
    assert.equal(formatDate("2026-01-01"), "January 1, 2026");
  });

  it("escapeMarkdown escapes markdown punctuation", () => {
    assert.equal(escapeMarkdown("a_b [c] <d>"), "a\\_b \\[c\\] \\<d\\>");
  });

  it("renderStandardTerms bolds cover page references", () => {
    assert.equal(
      renderStandardTerms('the <span class="coverpage_link">MNDA Term</span>.'),
      "the **MNDA Term**.",
    );
  });
});

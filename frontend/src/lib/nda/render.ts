import type { NdaFormData, Party } from "./types";

/**
 * Fills the Common Paper Mutual NDA Cover Page with the user's answers and
 * appends the (unmodified) Standard Terms, producing plain markdown.
 *
 * Placeholders are replaced by exact string match against the template in
 * `templates/Mutual-NDA-coverpage.md`. If the template changes, `replaceOnce`
 * throws and the unit tests fail, rather than silently leaving gaps.
 */

/** Cover Page text that gets replaced, copied verbatim from the template. */
export const COVER_PLACEHOLDERS = {
  purpose:
    "[Evaluating whether to enter into a business relationship with the other party.]",
  effectiveDate: "[Today’s date]",
  mndaTermFixed: "- [x]     Expires [1 year(s)] from Effective Date.",
  mndaTermOpen:
    "- [ ]     Continues until terminated in accordance with the terms of the MNDA.",
  confidentialityFixed:
    "- [x]     [1 year(s)] from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.",
  confidentialityPerpetual: "- [ ]     In perpetuity.",
  governingLaw: "Governing Law: [Fill in state]",
  jurisdiction:
    "Jurisdiction: [Fill in city or county and state, i.e. “courts located in New Castle, DE”]",
  modifications: "List any modifications to the MNDA",
  printName: "| Print Name | |",
  title: "| Title | | |",
  company: "| Company | | |",
  noticeAddress:
    "| Notice Address <label>Use either email or postal address</label> | | |",
} as const;

/** Backslash-escapes characters that would otherwise be read as markdown. */
export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_[\]<>|#~]/g, "\\$&");
}

/**
 * A user-supplied value, or a highlighted `[Label]` placeholder when empty.
 * Placeholders use inline code, which the preview renders as a highlight.
 */
function inline(value: string, label: string): string {
  const trimmed = value.trim().replace(/\s*\n\s*/g, " ");
  return trimmed ? escapeMarkdown(trimmed) : `\`[${label}]\``;
}

/** Multi-line text: keeps the user's line breaks as markdown hard breaks. */
function block(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) return `\`[${label}]\``;
  return trimmed
    .split(/\r?\n/)
    .map((line) => escapeMarkdown(line.trim()))
    .join("  \n");
}

function yearsText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "`[number of years]`";
  return `${escapeMarkdown(trimmed)} ${trimmed === "1" ? "year" : "years"}`;
}

/** `2026-11-08` → `November 8, 2026` (no timezone shift). */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "`[Effective Date]`";
  const [, y, m, d] = match.map(Number);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function checkbox(checked: boolean): string {
  return checked ? "- [x]" : "- [ ]";
}

function partyRow(
  label: string,
  data: NdaFormData,
  field: keyof Party,
  placeholder: string,
): string {
  const cell = (party: Party) => inline(party[field], placeholder);
  return `| ${label} | ${cell(data.party1)} | ${cell(data.party2)} |`;
}

function replaceOnce(source: string, find: string, replacement: string) {
  const count = source.split(find).length - 1;
  if (count !== 1) {
    throw new Error(
      `NDA template placeholder expected exactly once, found ${count}: ${find}`,
    );
  }
  return source.replace(find, () => replacement);
}

export function renderCoverPage(template: string, data: NdaFormData): string {
  const p = COVER_PLACEHOLDERS;
  const fixedTerm = data.mndaTermType === "fixed";
  const fixedConf = data.confidentialityType === "fixed";

  const replacements: [string, string][] = [
    [p.purpose, block(data.purpose, "Purpose")],
    [p.effectiveDate, formatDate(data.effectiveDate)],
    [
      p.mndaTermFixed,
      `${checkbox(fixedTerm)} Expires ${yearsText(data.mndaTermYears)} from Effective Date.`,
    ],
    [
      p.mndaTermOpen,
      `${checkbox(!fixedTerm)} Continues until terminated in accordance with the terms of the MNDA.`,
    ],
    [
      p.confidentialityFixed,
      `${checkbox(fixedConf)} ${yearsText(data.confidentialityYears)} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`,
    ],
    [p.confidentialityPerpetual, `${checkbox(!fixedConf)} In perpetuity.`],
    [p.governingLaw, `Governing Law: ${inline(data.governingLaw, "Governing Law")}`],
    [p.jurisdiction, `Jurisdiction: ${inline(data.jurisdiction, "Jurisdiction")}`],
    [
      p.modifications,
      data.modifications.trim() ? block(data.modifications, "Modifications") : "None.",
    ],
    [p.printName, partyRow("Print Name", data, "name", "Name")],
    [p.title, partyRow("Title", data, "title", "Title")],
    [p.company, partyRow("Company", data, "company", "Company")],
    [
      p.noticeAddress,
      partyRow("Notice Address", data, "noticeAddress", "Notice Address"),
    ],
  ];

  const filled = replacements.reduce(
    (doc, [find, replacement]) => replaceOnce(doc, find, replacement),
    template,
  );

  // Drop the form hints (`<label>…</label>`), including lines left empty.
  return filled.replace(/^[ \t]*<label>[^<]*<\/label>[ \t]*\n/gm, "").replace(
    /\s*<label>[^<]*<\/label>/g,
    "",
  );
}

/** Turns the template's cross-reference spans into bold plain-markdown text. */
export function renderStandardTerms(template: string): string {
  return template.replace(
    /<span class="coverpage_link">([^<]+)<\/span>/g,
    "**$1**",
  );
}

export function renderNda(
  coverTemplate: string,
  termsTemplate: string,
  data: NdaFormData,
): string {
  return `${renderCoverPage(coverTemplate, data).trimEnd()}\n\n---\n\n${renderStandardTerms(termsTemplate).trimEnd()}\n`;
}

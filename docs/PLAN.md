# PLAN: Mutual NDA Creator (prototype)

Jira: KAN-7 · Status: **planning only, no code yet**

## 1. Goal

A Next.js prototype that:

1. Collects the key information for a Mutual NDA (MNDA) through a form.
2. Shows the completed NDA with that information filled in.
3. Lets the user download the completed document to their machine.

## 2. Source material

The app uses the Common Paper Mutual NDA (v1.0, CC BY 4.0) that KAN-6 added:

| File | Role |
|---|---|
| `templates/Mutual-NDA-coverpage.md` | Cover Page. Holds every deal-specific field. **This is the part we fill in.** |
| `templates/Mutual-NDA.md` | Standard Terms. Fixed text that only refers to Cover Page terms by name (e.g. `<span class="coverpage_link">Purpose</span>`). It is **not edited**; it is added after the Cover Page. |
| `catalog.json` | Used to find the two files by name. |

A completed MNDA is therefore **filled Cover Page + Standard Terms, unchanged**. That matches how Common Paper expects the documents to be used: changes go on the Cover Page, never in the Standard Terms.

## 3. Fields to collect

Taken from the placeholders in the Cover Page:

| Section | Field | Input | Default / validation |
|---|---|---|---|
| Purpose | `purpose` | textarea | Default: "Evaluating whether to enter into a business relationship with the other party." Required. |
| Effective Date | `effectiveDate` | date | Default: today. Required. |
| MNDA Term | `mndaTermType` | radio: `fixed` / `untilTerminated` | Default `fixed` |
| | `mndaTermYears` | number | Default 1. Required when `fixed`, integer 1–10 |
| Term of Confidentiality | `confidentialityType` | radio: `fixed` / `perpetual` | Default `fixed` |
| | `confidentialityYears` | number | Default 1. Required when `fixed`, integer 1–10 |
| Governing Law | `governingLaw` | text (US state; could become a select) | Required, e.g. "Delaware" |
| Jurisdiction | `jurisdiction` | text | Required, e.g. "courts located in New Castle, DE" |
| MNDA Modifications | `modifications` | textarea | Optional. If empty, show "None." |
| Party 1 / Party 2 (each) | `name` (print name) | text | Required |
| | `title` | text | Required |
| | `company` | text | Required |
| | `noticeAddress` | text (email or postal) | Required |

Out of scope: **Signature** and **Date** in the signature table. They stay blank so the parties can sign the downloaded document.

## 4. User flow

One page at `/nda`, linked from the home page:

```
┌──────────── Form (left / top on mobile) ───────┐ ┌──── Live preview (right) ────┐
│ Purpose, Effective Date                        │ │ Mutual Non-Disclosure Agmt   │
│ MNDA Term ( ) 1 yr  ( ) until terminated       │ │ Cover Page with values filled │
│ Confidentiality ( ) 1 yr ( ) perpetual         │ │ ...                           │
│ Governing law, Jurisdiction, Modifications     │ │ Standard Terms                │
│ Party 1 | Party 2                              │ │ ...                           │
│ [Download PDF] [Download .md] [Reset]          │ │                               │
└────────────────────────────────────────────────┘ └───────────────────────────────┘
```

- The preview **updates live** as the user types. No separate "generate" step.
- Fields not filled in yet show as a highlighted placeholder (e.g. `[Governing Law]`), so it's clear what's missing.
- Download buttons stay disabled until the required fields are valid. Errors appear inline.
- Form state is saved in `localStorage` (wrapped in try/catch) so a refresh doesn't lose the user's input. **Reset** clears it.

## 5. Architecture

**The prototype runs entirely in the frontend.** It needs no backend calls, nothing is stored on a server, and the NDA data never leaves the browser. The existing FastAPI backend stays as it is; §9 covers when it would come in.

### 5.1 Loading templates
- `templates/` is at the repo root, outside `frontend/`. A **server component** (`app/nda/page.tsx`) reads both markdown files at build/render time with `fs.readFile(path.join(process.cwd(), "..", "templates", ...))` and passes the strings to the client component as props.
- If that path is unreliable in deployment, fall back to a `prebuild` script that copies `templates/` into `frontend/src/templates/` and imports the files as raw strings.

### 5.2 Filling the template (`frontend/src/lib/nda/`)
- `types.ts`: an `NdaFormData` type, plus the defaults.
- `validate.ts`: a pure function, `validate(data) → Record<field, error>`. Hand-written for now; `zod` is optional.
- `render.ts`: a pure function, `renderNda(coverMd, termsMd, data) → string` (the completed markdown):
  - Replaces each bracketed placeholder in the Cover Page with its value: `[Evaluating whether…]`, `[Today’s date]`, `[1 year(s)]` (twice, for the MNDA Term and the confidentiality term), `[Fill in state]`, `[Fill in city or county…]`.
  - Rewrites the two checkbox lists so that only the chosen option is `[x]`.
  - Fills the Print Name / Title / Company / Notice Address rows of the party table, and adds the Modifications text.
  - Turns the `<span class="coverpage_link">X</span>` tags in the Standard Terms into **bold** `X`, and removes the `<label>…</label>` hint tags. The output is then plain markdown.
  - Keeps the CC BY 4.0 attribution lines.
- Replacement uses **literal string matching on the known placeholders**, with no regex guessing. A unit test checks that every placeholder is found, so a change to the template breaks the test instead of failing silently.

### 5.3 Components (`frontend/src/components/nda/`)
- `NdaBuilder.tsx` (`"use client"`): holds the form state and computes `renderNda(...)` with `useMemo`.
- `NdaForm.tsx`: controlled inputs, grouped by section. `PartyFields.tsx` is used for each of the two parties.
- `NdaPreview.tsx`: renders the markdown with `react-markdown` + `remark-gfm` (needed for the signature table and checkboxes). It is styled as a document: serif font, page-width column.
- `DownloadButtons.tsx`

### 5.4 Download
| Format | How | Notes |
|---|---|---|
| **PDF** (main) | `window.print()` with a print stylesheet (`@media print`) that hides everything except the preview. The user picks "Save as PDF". | No dependencies, and the PDF looks like the preview. It does go through the browser's print dialog. |
| **Markdown** | `Blob` → object URL → `<a download="Mutual-NDA-<CompanyA>-<CompanyB>.md">` | Very little code. Easy to edit or diff. |
| *.docx (later)* | `docx` npm package, building from the same data | Only if users need to edit the result in Word. |

If a one-click PDF file with no dialog is required, switch to `@react-pdf/renderer` (that needs a separate layout for the PDF) or a backend HTML→PDF endpoint. See §8.

## 6. File changes (for the build ticket)

```
frontend/
  package.json                       + react-markdown, remark-gfm; "test": node --test
  src/app/page.tsx                   replace boilerplate with link to /nda
  src/app/nda/page.tsx               server component: load templates
  src/components/nda/NdaBuilder.tsx
  src/components/nda/NdaForm.tsx
  src/components/nda/PartyFields.tsx
  src/components/nda/NdaPreview.tsx
  src/components/nda/DownloadButtons.tsx
  src/lib/nda/types.ts
  src/lib/nda/validate.ts
  src/lib/nda/render.ts
  src/lib/nda/render.test.ts
  src/app/globals.css                print styles
README.md                            document the /nda feature
```

## 7. Testing & acceptance

**Unit tests (`node --test`; chosen over vitest to avoid a dev dependency and an @types/node bump)**
- `renderNda` with all fields filled: none of the original bracketed placeholders remain, and every value appears.
- Each term option (`fixed` with N years, `untilTerminated`, `perpetual`) checks exactly one box.
- Every `<span …>` and `<label>` tag is removed from the output.
- `validate`: required fields, conditional fields (years), number range.

**Manual checks**
- `npm run lint && npm run build` pass.
- Fill the form → the preview updates live → Download .md gives a file with the correct contents → Print/Save as PDF gives a clean document with no form controls.
- Refreshing the page keeps the input. Reset clears it.
- Usable at phone width.

**Acceptance criteria (from KAN-7)**
- [ ] The user can enter the key MNDA information in a form.
- [ ] The app shows the NDA with that information filled in.
- [ ] The user can download the completed document locally.

## 8. Open questions

1. **Download format.** Is print-to-PDF plus .md enough for the prototype, or is a direct .pdf/.docx file download required? *Recommendation: print-to-PDF + .md now; add .docx if users ask for it.*
2. **Governing law.** Allow free text, or limit it to a list of US states? The template says "laws of the State of…". *Recommendation: a US-state dropdown.*
3. **Branding/disclaimer.** Should the page carry a "not legal advice" notice? *Recommendation: yes, as a footer.*

## 9. Future (not in this prototype)

- A general template engine driven by `catalog.json`, covering the other 11 Common Paper agreements.
- Backend: save drafts, user accounts, server-side PDF/DOCX generation, e-signature.
- AI help to draft the Purpose / Modifications text.

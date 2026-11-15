import { readFile } from "node:fs/promises";
import path from "node:path";

/** Repo-root `templates/` directory (added in KAN-6), relative to `frontend/`. */
const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

export interface NdaTemplates {
  cover: string;
  terms: string;
}

/**
 * Reads the Common Paper Mutual NDA templates. Runs once at build time; the
 * static export bakes the result into the page.
 */
export async function loadNdaTemplates(): Promise<NdaTemplates> {
  const [cover, terms] = await Promise.all([
    readFile(path.join(TEMPLATES_DIR, "Mutual-NDA-coverpage.md"), "utf8"),
    readFile(path.join(TEMPLATES_DIR, "Mutual-NDA.md"), "utf8"),
  ]);
  return { cover, terms };
}

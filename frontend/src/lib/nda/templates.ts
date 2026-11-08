import { readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";

/** Repo-root `templates/` directory (added in KAN-6), relative to `frontend/`. */
const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

export interface NdaTemplates {
  cover: string;
  terms: string;
}

/**
 * Reads the Common Paper Mutual NDA templates. Cached so the files are read
 * once and the result is baked into the prerendered page.
 */
export async function loadNdaTemplates(): Promise<NdaTemplates> {
  "use cache";
  cacheLife("max");

  const [cover, terms] = await Promise.all([
    readFile(path.join(TEMPLATES_DIR, "Mutual-NDA-coverpage.md"), "utf8"),
    readFile(path.join(TEMPLATES_DIR, "Mutual-NDA.md"), "utf8"),
  ]);
  return { cover, terms };
}

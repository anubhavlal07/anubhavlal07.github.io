import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientSource = await readFile(join(root, "assets/js/supabaseClient.js"), "utf8");
const url = process.env.SUPABASE_URL || clientSource.match(/SUPABASE_URL\s*=\s*'([^']+)'/)[1];
const key = process.env.SUPABASE_ANON_KEY || clientSource.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/)[1];

const tables = {
  profile: "",
  social_links: "&order=display_order.asc",
  skills: "&order=display_order.asc",
  skill_items: "&order=display_order.asc",
  experience: "&order=display_order.asc",
  projects: "&order=is_featured.desc,display_order.asc",
  resume: "",
};

const outDir = join(root, "assets/json");
await mkdir(outDir, { recursive: true });

let changed = 0;
for (const [table, order] of Object.entries(tables)) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*${order}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${table}: no rows returned`);
  const file = join(outDir, `${table}.json`);
  const next = JSON.stringify(rows, null, 2) + "\n";
  const previous = await readFile(file, "utf8").catch(() => "");
  if (previous !== next) {
    await writeFile(file, next);
    changed += 1;
    console.log(`updated ${table}.json (${rows.length} rows)`);
  }
}
console.log(changed ? `${changed} file(s) changed` : "no changes");

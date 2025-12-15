import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const SOURCE_DIR = path.resolve("knowledge/source-docs");
const OUT_FILE = path.resolve("knowledge/generated/knowledge_store.json");

function slug(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function chunkText(text, { maxChars = 900 } = {}) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const chunks = [];
  let buf = [];
  let len = 0;

  for (const line of lines) {
    if (len + line.length + 1 > maxChars && buf.length) {
      chunks.push(buf.join("\n"));
      buf = [];
      len = 0;
    }
    buf.push(line);
    len += line.length + 1;
  }
  if (buf.length) chunks.push(buf.join("\n"));
  return chunks;
}

function inferTags(text) {
  const t = text.toLowerCase();
  const tags = [];
  const add = (tag, cond) => cond && tags.push(tag);

  add("onboarding", t.includes("onboarding") || t.includes("kickoff"));
  add("success-plan", t.includes("success plan"));
  add("renewals", t.includes("renewal"));
  add("risk", t.includes("risk") || t.includes("red flag"));
  add("ebrs", t.includes("ebr") || t.includes("executive business review"));
  add("handoff", t.includes("handoff"));
  add("adoption", t.includes("adoption") || t.includes("enablement"));

  return Array.from(new Set(tags));
}

async function run() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error("Missing folder:", SOURCE_DIR);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith(".docx"));

  const store = [];
  for (const file of files) {
    const full = path.join(SOURCE_DIR, file);
    const docName = file.replace(/\.docx$/i, "");

    const { value } = await mammoth.extractRawText({ path: full });
    const text = (value || "").trim();

    if (!text) continue;

    const chunks = chunkText(text, { maxChars: 900 });

    chunks.forEach((chunk, idx) => {
      const id = `${slug(docName)}-${String(idx + 1).padStart(3, "0")}`;

      // “section” is best-effort in v0 (later we’ll detect headings properly)
      const firstLine = chunk.split("\n")[0]?.slice(0, 80) || "Section";
      const section = firstLine.length > 5 ? firstLine : "Section";

      store.push({
        id,
        doc: docName,
        section,
        tags: inferTags(chunk),
        text: chunk,
      });
    });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(store, null, 2), "utf8");
  console.log(`✅ Generated ${store.length} chunks → ${OUT_FILE}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
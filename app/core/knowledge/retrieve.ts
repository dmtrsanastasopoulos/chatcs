import { KNOWLEDGE_STORE, type KnowledgeChunk } from "./store";

export type RetrievalResult = {
  chunk: KnowledgeChunk;
  score: number;
  dbg?: {
    intent?: string;
    base: number;
    boost: number;
    penalty: number;
    final: number;
  };
};

type Intent =
  | "kickoff"
  | "training"
  | "cadence"
  | "success_plan"
  | "renewal"
  | "ebr"
  | "risk"
  | "onboarding"
  | "unknown";

const tokenize = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

function detectIntent(qRaw: string): Intent {
  const q = (qRaw || "").toLowerCase();

  // very explicit wins
  if (/\bkick[\s-]?off\b/.test(q) || /\bkickoff\b/.test(q)) return "kickoff";
  if (/\btraining\b/.test(q) || /\benablement\b/.test(q)) return "training";
  if (/\bcadence\b/.test(q) || /\bqbr\b/.test(q) || /\bweekly\b/.test(q) || /\bmonthly\b/.test(q))
    return "cadence";
  if (/\bsuccess plan\b/.test(q) || /\bobjective\b/.test(q) || /\binitiative\b/.test(q))
    return "success_plan";
  if (/\brenewal\b/.test(q)) return "renewal";
  if (/\bebr\b/.test(q) || /\bexecutive business review\b/.test(q)) return "ebr";
  if (/\brisk\b/.test(q) || /\bmitigat\b/.test(q) || /\bhealth\b/.test(q)) return "risk";
  if (/\bonboarding\b/.test(q)) return "onboarding";

  return "unknown";
}

const INTENT_KEYWORDS: Record<Exclude<Intent, "unknown">, string[]> = {
  kickoff: ["kickoff", "kick off", "agenda", "deck", "outcome", "stakeholder", "owners", "timeline", "alignment"],
  training: ["training", "enablement", "hands-on", "demo", "workflows", "deck"],
  cadence: ["cadence", "weekly", "monthly", "call", "agenda", "follow-up", "action items"],
  success_plan: ["success plan", "objective", "initiative", "owners", "success criteria", "timeline"],
  renewal: ["renewal", "cta", "close plan"],
  ebr: ["ebr", "executive", "business review", "presentation"],
  risk: ["risk", "health", "mitigation", "warning", "red flag", "churn"],
  onboarding: ["onboarding", "time to value", "ttv", "kickoff", "training"],
};

function countIntentHits(text: string, intent: Exclude<Intent, "unknown">) {
  const t = (text || "").toLowerCase();
  let hits = 0;
  for (const kw of INTENT_KEYWORDS[intent]) {
    if (t.includes(kw)) hits += 1;
  }
  return hits;
}

// If section is useless noise, penalize hard.
function isLowSignalSection(section: string) {
  const s = (section || "").toLowerCase().trim();
  return s === "author" || s === "table of contents" || s === "resources" || s === "appendix";
}

function queryMentionsCadence(qRaw: string) {
  const q = (qRaw || "").toLowerCase();
  return /\bcadence\b/.test(q) || /\bweekly\b/.test(q) || /\bmonthly\b/.test(q) || /\bqbr\b/.test(q);
}

export function retrieveKnowledge(query: string, topK = 6): RetrievalResult[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const qSet = new Set(uniq(qTokens));
  const intent = detectIntent(query);
  const mentionsCadence = queryMentionsCadence(query);

  const results: RetrievalResult[] = KNOWLEDGE_STORE.map((chunk) => {
    const bodyTokens = tokenize(chunk.text);
    const sectionTokens = tokenize(chunk.section);
    const titleTokens = tokenize(chunk.doc);
    const tagTokens = (chunk.tags || []).flatMap(tokenize);

    let base = 0;

    // weight: tags > section > doc title > body
    for (const t of tagTokens) if (qSet.has(t)) base += 4;
    for (const t of sectionTokens) if (qSet.has(t)) base += 3;
    for (const t of titleTokens) if (qSet.has(t)) base += 2;
    for (const t of bodyTokens) if (qSet.has(t)) base += 1;

    let boost = 0;
    let penalty = 0;

    // intent boost / penalty
    if (intent !== "unknown") {
      const combined = `${chunk.doc}\n${chunk.section}\n${chunk.text}`.toLowerCase();

      const hits = countIntentHits(combined, intent);
      boost += hits * 6; // big boost so intent dominates

      // penalize “neighbor intents” when user is specific
      if (intent === "kickoff") {
        const trainingHits = countIntentHits(combined, "training");
        if (trainingHits >= 2 && hits < trainingHits) penalty += 18;

        // ✅ NEW: downrank cadence-heavy chunks for kickoff questions
        // unless the user explicitly mentioned cadence.
        if (!mentionsCadence) {
          const cadenceHits = countIntentHits(combined, "cadence");
          // if cadence language dominates this chunk, push it down for kickoff queries
          if (cadenceHits >= 2 && hits < cadenceHits) penalty += 22;
          // also light penalty if the doc/section screams cadence
          if (combined.includes("cadence calls") || combined.includes("cadence call")) penalty += 10;
        }
      }

      if (intent === "training") {
        const kickoffHits = countIntentHits(combined, "kickoff");
        if (kickoffHits >= 2 && hits < kickoffHits) penalty += 12;

        // ✅ NEW (symmetric): downrank cadence-heavy chunks for training questions
        if (!mentionsCadence) {
          const cadenceHits = countIntentHits(combined, "cadence");
          if (cadenceHits >= 2 && hits < cadenceHits) penalty += 18;
          if (combined.includes("cadence calls") || combined.includes("cadence call")) penalty += 8;
        }
      }
    }

    // penalize low-signal sections
    if (isLowSignalSection(chunk.section)) penalty += 30;

    // penalize super-long chunks: they tend to be “everything and nothing”
    const len = (chunk.text || "").length;
    if (len > 1200) penalty += 10;
    if (len > 2200) penalty += 25;

    // small penalty if it looks like a “template line”
    const txt = (chunk.text || "").toLowerCase();
    if (txt.includes("<customer_name>") || txt.includes("template")) penalty += 6;

    const final = Math.max(0, base + boost - penalty);

    return {
      chunk,
      score: final,
      dbg: {
        intent,
        base,
        boost,
        penalty,
        final,
      },
    };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // de-dup: if multiple chunks from same doc+section, keep best one
  const picked: RetrievalResult[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    const key = `${r.chunk.doc}::${r.chunk.section}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(r);
    if (picked.length >= topK) break;
  }

  return picked;
}
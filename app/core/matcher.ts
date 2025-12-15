console.log("MATCHER VERSION: v2 punctuation-normalize");
import type { MatchResult } from "../types/core";
import { CANONICALS } from "./canonicals";

// Super simple, deterministic v0 matcher:
// 1) exact/contains on variations (highest confidence)
// 2) keyword contains (medium confidence)
// 3) fallback to onboarding_completion (low confidence)
export function matchCanonical(inputRaw: string): MatchResult {
  const input = (inputRaw || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ");
  if (!input) {
    return { canonicalId: "onboarding_completion", confidence: 0.1, matchedBy: "fallback" };
  }

  // 1) variations
  for (const c of CANONICALS) {
    for (const v of c.variations) {
      const vv = v.toLowerCase();
      if (input === vv || input.includes(vv) || vv.includes(input)) {
        return { canonicalId: c.id, confidence: 0.95, matchedBy: "variation" };
      }
    }
  }

  // 2) keywords
  let best: { id: any; score: number } | null = null;
  for (const c of CANONICALS) {
    const kws = c.keywords || [];
    let score = 0;
    for (const kw of kws) {
      if (input.includes(kw.toLowerCase())) score += 1;
    }
    if (!best || score > best.score) best = { id: c.id, score };
  }

  if (best && best.score >= 1) {
    // map score to confidence loosely
    const confidence = Math.min(0.85, 0.45 + best.score * 0.15);
    return { canonicalId: best.id, confidence, matchedBy: "keyword" };
  }

  return { canonicalId: "onboarding_completion", confidence: 0.25, matchedBy: "fallback" };
}
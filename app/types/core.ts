export type Domain = "onboarding" | "risk";

// Keep IDs flexible for MVP (avoid maintaining huge unions)
export type CanonicalId = string;
export type AnswerId = string;
export type FollowUpId = string;

export interface Canonical {
  id: CanonicalId;
  domain: Domain;
  question: string;
  intent: string;
  variations: string[];
  keywords?: string[];
  primaryAnswerId: AnswerId;
}

export interface Answer {
  id: AnswerId;
  canonicalId: CanonicalId; // keep required so engine can show interpretedAs
  title: string;
  content: string; // plain text
}

export interface FollowUp {
  id: FollowUpId;
  parentAnswerId: AnswerId;
  label: string;
  targetAnswerId: AnswerId; // IMPORTANT: no more nulls
  targetCanonicalId?: CanonicalId;
  intent: string;
}

export interface MatchResult {
  canonicalId: CanonicalId;
  confidence: number; // 0..1
  matchedBy: "variation" | "keyword" | "fallback";
}

export interface EngineResponse {
  interpretedAs: string;
  canonicalId: CanonicalId;
  answer: {
    answerId: AnswerId;
    title: string;
    content: string;
  };
  suggestions: Array<{
    id: FollowUpId;
    label: string;
    targetAnswerId: AnswerId;
    targetCanonicalId?: CanonicalId;
  }>;
}
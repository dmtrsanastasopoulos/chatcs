import type { EngineResponse, AnswerId } from "../types/core";
import { CANONICALS } from "./canonicals";
import { ANSWERS } from "./answers";
import { FOLLOW_UPS } from "./followups";
import { matchCanonical } from "./matcher";

function getCanonical(canonicalId: string) {
  const c = CANONICALS.find((x) => x.id === canonicalId);
  if (!c) throw new Error(`Canonical not found: ${canonicalId}`);
  return c;
}

function getAnswer(answerId: AnswerId) {
  const a = ANSWERS.find((x) => x.id === answerId);
  if (!a) throw new Error(`Answer not found: ${answerId}`);
  return a;
}

function suggestionsForAnswer(answer: { id: AnswerId; canonicalId: string }) {
  // First: direct children
  const direct = FOLLOW_UPS.filter((fu) => fu.parentAnswerId === answer.id);

  if (direct.length > 0) return direct;

  // Fallback: show the canonical's primary answer followups
  const canonical = getCanonical(answer.canonicalId);
  const primary = canonical.primaryAnswerId;

  return FOLLOW_UPS.filter((fu) => fu.parentAnswerId === primary);
}

export function runEngine(input: string, opts?: { targetAnswerId?: AnswerId }): EngineResponse {
  // Follow-up jump
  if (opts?.targetAnswerId) {
    const answer = getAnswer(opts.targetAnswerId);
    const canonical = getCanonical(answer.canonicalId);

    const suggestions = suggestionsForAnswer(answer).map((fu) => ({
      id: fu.id,
      label: fu.label,
      targetAnswerId: fu.targetAnswerId,
      targetCanonicalId: fu.targetCanonicalId,
    }));

    return {
      interpretedAs: canonical.question,
      canonicalId: canonical.id,
      answer: { answerId: answer.id, title: answer.title, content: answer.content },
      suggestions,
    };
  }

  // Normal question → match canonical
  const match = matchCanonical(input);
  const canonical = getCanonical(match.canonicalId);
  const answer = getAnswer(canonical.primaryAnswerId);

  const suggestions = suggestionsForAnswer(answer).map((fu) => ({
    id: fu.id,
    label: fu.label,
    targetAnswerId: fu.targetAnswerId,
    targetCanonicalId: fu.targetCanonicalId,
  }));

  return {
    interpretedAs: canonical.question,
    canonicalId: canonical.id,
    answer: { answerId: answer.id, title: answer.title, content: answer.content },
    suggestions,
  };
}
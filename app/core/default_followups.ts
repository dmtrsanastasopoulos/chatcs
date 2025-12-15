import type { AnswerId, CanonicalId } from "../types/core";

export type UiSuggestion = {
  id: string;
  label: string;
  targetAnswerId: AnswerId | null;
  targetCanonicalId?: CanonicalId;
};

export function defaultSuggestionsFor(answerId: AnswerId): UiSuggestion[] {
  return [
    { id: `fu_default_next_${answerId}`, label: "What should I do next?", targetAnswerId: null },
    { id: `fu_default_example_${answerId}`, label: "Give me a concrete example / script", targetAnswerId: null },
    { id: `fu_default_checklist_${answerId}`, label: "Give me a checklist", targetAnswerId: null },
    { id: `fu_default_related_${answerId}`, label: "Show me related guidance", targetAnswerId: null },
  ];
}
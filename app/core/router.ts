import type { AnswerId, FollowUpId } from "../types/core";
import { runEngine } from "./engine";
import { runKnowledgeEngine } from "./knowledge/rag_engine";
import { FOLLOW_UPS_BY_ID } from "./followups_store";

export function routeQuestion(
  input: string,
  opts?: { targetAnswerId?: AnswerId | FollowUpId }
) {
  const text = (input || "").trim();

  /**
   * CASE 1:
   * User clicked a follow-up (fu_*)
   */
  if (opts?.targetAnswerId) {
    const id = opts.targetAnswerId;

    // Try resolving as follow-up first
    const followUp = FOLLOW_UPS_BY_ID[id as FollowUpId];

    if (followUp) {
      // Follow-up routes to another concrete answer
      if (followUp.targetAnswerId) {
        return runEngine(text, {
          targetAnswerId: followUp.targetAnswerId,
        });
      }

      // Follow-up routes to another canonical (future-proof)
      if (followUp.targetCanonicalId) {
        return runEngine(followUp.targetCanonicalId);
      }

      // Follow-up without implementation yet → use knowledge
      return runKnowledgeEngine(followUp.label);
    }

    // Otherwise treat it as a direct AnswerId
    return runEngine(text, { targetAnswerId: id as AnswerId });
  }

  /**
   * CASE 2:
   * Fresh user question
   * → Try playbook first
   * → Fallback to knowledge
   */
  try {
    return runEngine(text);
  } catch {
    return runKnowledgeEngine(text);
  }
}
import { retrieveKnowledge } from "./retrieve";

export type KnowledgeCitation = {
  chunkId: string;
  doc: string;
  section: string;
};

export type KnowledgeResponse = {
  mode: "knowledge";
  interpretedAs?: string;
  answer: {
    title: string;
    content: string;
  };
  citations: KnowledgeCitation[];
  suggestions: Array<{
    id: string;
    label: string;
    targetAnswerId: null;
  }>;
  debug?: any;
};

type Intent =
  | "kickoff"
  | "training"
  | "cadence"
  | "success_plan"
  | "risk"
  | "renewal"
  | "escalation"
  | "generic";

function detectIntent(query: string): Intent {
  const q = (query || "").toLowerCase();

  // Order matters: more specific first
  if (q.includes("kickoff")) return "kickoff";
  if (q.includes("training")) return "training";
  if (q.includes("cadence")) return "cadence";
  if (q.includes("success plan")) return "success_plan";

  // extra useful intents (optional)
  if (q.includes("renew") || q.includes("renewal")) return "renewal";
  if (q.includes("risk") || q.includes("at risk") || q.includes("health")) return "risk";
  if (q.includes("escalat") || q.includes("urgent") || q.includes("sev")) return "escalation";

  return "generic";
}

function headlineForIntent(intent: Intent): string {
  switch (intent) {
    case "kickoff":
      return "What should come out of the kickoff call";
    case "training":
      return "What should come out of the training call";
    case "cadence":
      return "How to run a strong cadence call";
    case "success_plan":
      return "How to build and maintain the success plan";
    case "risk":
      return "How to detect and handle account risk";
    case "renewal":
      return "How to run renewal prep and tracking";
    case "escalation":
      return "How to escalate effectively";
    default:
      return "Answer (from internal docs)";
  }
}

function shortAnswerForIntent(intent: Intent): string {
  switch (intent) {
    case "kickoff":
      return "Kickoff is “complete” when both sides leave with aligned outcomes, clear owners, and a concrete plan — not when the call ends.";
    case "training":
      return "Training is “complete” when users can perform the core workflow themselves and you’ve agreed the next steps (what happens after the session).";
    case "cadence":
      return "A cadence call is “good” when it produces decisions, next actions, and visible progress against objectives — not just a status update.";
    case "success_plan":
      return "A success plan works when it’s a living doc with measurable outcomes, owners, and timelines — and you actually run the account off it.";
    case "risk":
      return "An account is “at risk” when value is slipping (usage, milestones, champion, ROI clarity) — not when they finally complain.";
    case "renewal":
      return "Renewal work is “done” when risks are surfaced early, value is proven, and stakeholders are aligned before the clock runs out.";
    case "escalation":
      return "Escalation is effective when it’s specific (impact, scope, timeline, owner) and comes with a clear ask — not a panic ping.";
    default:
      return "Based on our internal docs, here’s the practical guidance grounded in the snippets that match your question.";
  }
}

function suggestionsForIntent(intent: Intent): KnowledgeResponse["suggestions"] {
  switch (intent) {
    case "kickoff":
      return [
        { id: "kfu-kickoff-1", label: "Give me a kickoff agenda checklist", targetAnswerId: null },
        { id: "kfu-kickoff-2", label: "What should be documented right after the kickoff?", targetAnswerId: null },
        { id: "kfu-kickoff-3", label: "Who must attend the kickoff and why?", targetAnswerId: null },
        { id: "kfu-kickoff-4", label: "What are common kickoff red flags?", targetAnswerId: null },
      ];
    case "training":
      return [
        { id: "kfu-training-1", label: "Give me a training agenda checklist", targetAnswerId: null },
        { id: "kfu-training-2", label: "How do I confirm users actually understood?", targetAnswerId: null },
        { id: "kfu-training-3", label: "What homework should the customer do after training?", targetAnswerId: null },
        { id: "kfu-training-4", label: "What if the customer is lost or passive in training?", targetAnswerId: null },
      ];
    case "cadence":
      return [
        { id: "kfu-cadence-1", label: "Give me a cadence call agenda template", targetAnswerId: null },
        { id: "kfu-cadence-2", label: "What makes a cadence call ineffective?", targetAnswerId: null },
        { id: "kfu-cadence-3", label: "How do I drive next actions every call?", targetAnswerId: null },
        { id: "kfu-cadence-4", label: "How should I follow up after the cadence call?", targetAnswerId: null },
      ];
    case "success_plan":
      return [
        { id: "kfu-sp-1", label: "Give me a success plan template", targetAnswerId: null },
        { id: "kfu-sp-2", label: "How do we keep the success plan updated?", targetAnswerId: null },
        { id: "kfu-sp-3", label: "How do objectives and initiatives map in the plan?", targetAnswerId: null },
        { id: "kfu-sp-4", label: "What are common success plan mistakes?", targetAnswerId: null },
      ];
    case "risk":
      return [
        { id: "kfu-risk-1", label: "Give me a checklist of risk signals", targetAnswerId: null },
        { id: "kfu-risk-2", label: "What should I do in the first 48h of risk?", targetAnswerId: null },
        { id: "kfu-risk-3", label: "How do I handle champion change?", targetAnswerId: null },
        { id: "kfu-risk-4", label: "When should I escalate internally?", targetAnswerId: null },
      ];
    case "renewal":
      return [
        { id: "kfu-renew-1", label: "Give me a renewal prep checklist", targetAnswerId: null },
        { id: "kfu-renew-2", label: "What proof of value should I collect?", targetAnswerId: null },
        { id: "kfu-renew-3", label: "How early should renewal work start?", targetAnswerId: null },
        { id: "kfu-renew-4", label: "What are the most common renewal risks?", targetAnswerId: null },
      ];
    case "escalation":
      return [
        { id: "kfu-esc-1", label: "How do I write a good escalation summary?", targetAnswerId: null },
        { id: "kfu-esc-2", label: "What info do engineers need to act fast?", targetAnswerId: null },
        { id: "kfu-esc-3", label: "When is escalation justified vs noise?", targetAnswerId: null },
        { id: "kfu-esc-4", label: "How do I set expectations with the customer?", targetAnswerId: null },
      ];
    default:
      return [
        { id: "kfu-gen-1", label: "Give me a step-by-step checklist for this", targetAnswerId: null },
        { id: "kfu-gen-2", label: "What should I do before escalating?", targetAnswerId: null },
        { id: "kfu-gen-3", label: "What are common red flags to watch for?", targetAnswerId: null },
      ];
  }
}

function trimBullet(s: string, max = 220) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trim() + "…";
}

export function runKnowledgeEngine(query: string): KnowledgeResponse {
  const retrieved = retrieveKnowledge(query, 6);
  const intent = detectIntent(query);
  const headline = headlineForIntent(intent);

  // If retrieval is weak, do NOT improvise. Ask for clarification.
  if (retrieved.length === 0 || retrieved[0].score < 18) {
    return {
      mode: "knowledge",
      interpretedAs: "I need more context to answer reliably from the docs.",
      answer: {
        title: "Quick clarification",
        content:
          "I couldn’t find a strong match in the current knowledge snippets.\n\n" +
          "Can you clarify one thing so I can answer accurately?\n" +
          "- Is this about kickoff, training, cadence calls, success plans, renewals, escalation, or account risk?\n" +
          "- And what stage are you in (pre-kickoff, mid-onboarding, post-onboarding)?",
      },
      citations: [],
      suggestions: [
        { id: "kfu-001", label: "This is about kickoff", targetAnswerId: null },
        { id: "kfu-002", label: "This is about training", targetAnswerId: null },
        { id: "kfu-003", label: "This is about cadence calls", targetAnswerId: null },
        { id: "kfu-004", label: "This is about success plans", targetAnswerId: null },
        { id: "kfu-005", label: "This is about account risk", targetAnswerId: null },
      ],
      debug: { intent, retrieved },
    };
  }

  const citations = retrieved.map((r) => ({
    chunkId: r.chunk.id,
    doc: r.chunk.doc,
    section: r.chunk.section,
  }));

  // Make output readable:
  // - bulletize chunks
  // - trim bullets
  const bullets = retrieved.map((r) => `- ${trimBullet(r.chunk.text)}`);

  const content =
    `**Short answer:** ${shortAnswerForIntent(intent)}\n\n` +
    `## ${headline}\n\n` +
    bullets.join("\n") +
    `\n\nIf you share your situation (what happened, what changed, timeline), I can point you to the exact next steps.`;

  return {
    mode: "knowledge",
    interpretedAs: "Question matched to internal documentation snippets",
    answer: { title: "Answer (from internal docs)", content },
    citations,
    suggestions: suggestionsForIntent(intent),
    debug: {
      intent,
      retrieved: retrieved.map((r) => ({
        id: r.chunk.id,
        doc: r.chunk.doc,
        section: r.chunk.section,
        score: r.score,
        dbg: r.dbg,
      })),
    },
  };
}
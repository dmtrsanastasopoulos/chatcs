import { retrieveKnowledge, type RetrievalResult } from "./retrieve";

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
  debug?: {
    intent?: string;
    retrieved?: Array<{
      id: string;
      doc: string;
      section: string;
      score: number;
      dbg?: any;
    }>;
  };
};

function detectHeadline(query: string) {
  const q = (query || "").toLowerCase();
  if (q.includes("kickoff")) return "What should come out of the kickoff call";
  if (q.includes("training")) return "What should come out of the training call";
  if (q.includes("cadence")) return "How to run a strong cadence call";
  if (q.includes("success plan")) return "How to build and maintain the success plan";
  return "Answer (from internal docs)";
}

function trimBullet(s: string, max = 220) {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trim() + "…";
}

function detectIntentFromQuery(query: string): string | undefined {
  const q = (query || "").toLowerCase();
  if (q.includes("kickoff")) return "kickoff";
  if (q.includes("training") || q.includes("enablement")) return "training";
  if (q.includes("cadence")) return "cadence";
  if (q.includes("success plan")) return "success_plan";
  if (q.includes("renewal")) return "renewal";
  if (q.includes("ebr")) return "ebr";
  if (q.includes("risk") || q.includes("health")) return "risk";
  if (q.includes("onboarding")) return "onboarding";
  return undefined;
}

export function runKnowledgeEngine(query: string): KnowledgeResponse {
  const retrieved: RetrievalResult[] = retrieveKnowledge(query, 6);

  if (retrieved.length === 0 || retrieved[0].score < 18) {
    return {
      mode: "knowledge",
      interpretedAs: "I need more context to answer reliably from the docs.",
      answer: {
        title: "Quick clarification",
        content:
          "I couldn’t find a strong match in the current knowledge snippets.\n\n" +
          "Can you clarify one thing so I can answer accurately?\n" +
          "- Is this about kickoff, training, cadence calls, success plans, renewals, or account risk?\n" +
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
      debug: {
        intent: detectIntentFromQuery(query),
        retrieved: retrieved.map((r: RetrievalResult) => ({
          id: r.chunk.id,
          doc: r.chunk.doc,
          section: r.chunk.section,
          score: r.score,
          dbg: r.dbg,
        })),
      },
    };
  }

  const citations: KnowledgeCitation[] = retrieved.map((r: RetrievalResult) => ({
    chunkId: r.chunk.id,
    doc: r.chunk.doc,
    section: r.chunk.section,
  }));

  const title = detectHeadline(query);
  const bullets = retrieved.map((r: RetrievalResult) => `- ${trimBullet(r.chunk.text)}`);

  const content =
    `**Short answer:** ${title} is “complete” when both sides leave with aligned outcomes, clear owners, and a concrete plan — not when the call ends.\n\n` +
    `## ${title}\n\n` +
    bullets.join("\n") +
    `\n\nIf you share your situation (what happened, what changed, timeline), I can point you to the exact next steps.`;

  // Suggestions ανά intent (για να μη σου πετάει kickoff suggestions στο training)
  const intent = detectIntentFromQuery(query);

  const suggestions =
    intent === "training"
      ? [
          { id: "kfu-training-1", label: "Give me a training agenda checklist", targetAnswerId: null },
          { id: "kfu-training-2", label: "How do I confirm users actually understood?", targetAnswerId: null },
          { id: "kfu-training-3", label: "What homework should the customer do after training?", targetAnswerId: null },
          { id: "kfu-training-4", label: "What if the customer is lost or passive in training?", targetAnswerId: null },
        ]
      : [
          { id: "kfu-kickoff-1", label: "Give me a kickoff agenda checklist", targetAnswerId: null },
          { id: "kfu-kickoff-2", label: "What should be documented right after the kickoff?", targetAnswerId: null },
          { id: "kfu-kickoff-3", label: "Who must attend the kickoff and why?", targetAnswerId: null },
          { id: "kfu-kickoff-4", label: "What are common kickoff red flags?", targetAnswerId: null },
        ];

  return {
    mode: "knowledge",
    interpretedAs: "Question matched to internal documentation snippets",
    answer: { title: "Answer (from internal docs)", content },
    citations,
    suggestions,
    debug: {
      intent,
      retrieved: retrieved.map((r: RetrievalResult) => ({
        id: r.chunk.id,
        doc: r.chunk.doc,
        section: r.chunk.section,
        score: r.score,
        dbg: r.dbg,
      })),
    },
  };
}
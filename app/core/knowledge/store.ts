import store from "../../../knowledge/generated/knowledge_store.json";

export type KnowledgeChunk = {
  id: string;
  doc: string;
  section: string;
  tags?: string[];
  text: string;
};

export const KNOWLEDGE_STORE = store as KnowledgeChunk[];
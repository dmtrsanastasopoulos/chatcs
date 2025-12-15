import type { FollowUpId, FollowUp } from "../types/core";
import { FOLLOW_UPS } from "./followups";

export const FOLLOW_UPS_BY_ID: Record<FollowUpId, FollowUp> = Object.fromEntries(
  FOLLOW_UPS.map((f) => [f.id, f])
) as Record<FollowUpId, FollowUp>;
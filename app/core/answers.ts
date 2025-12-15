import type { Answer } from "../types/core";

export const ANSWERS: Answer[] = [
  // =========================
  // PRIMARY ANSWERS
  // =========================
  {
    id: "a_onboarding_completion_primary",
    canonicalId: "onboarding_completion",
    title: "When is onboarding considered complete?",
    content:
`Short answer
Onboarding is complete when the customer has achieved first verified value, not when technical setup is finished.

Onboarding can be considered complete when all of the following are true:
- A kickoff call has taken place and expectations are aligned
- A success plan is defined and agreed with the customer
- Initial training or enablement has been delivered
- First value has been achieved and acknowledged
- A regular communication cadence is in place

Important
If setup is complete but the customer hasn’t experienced value, onboarding is not complete.`
  },
  {
    id: "a_kickoff_outcomes_primary",
    canonicalId: "kickoff_outcomes",
    title: "What should come out of the kickoff call?",
    content:
`Short answer
The kickoff call is successful when both sides leave with a shared definition of success, clear ownership, and agreed next steps.

After the kickoff call, the following must be clear:
- The customer’s business problem and desired outcomes
- Success criteria and how value will be measured
- Scope of onboarding (what’s in / what’s out)
- Stakeholders and decision-makers on both sides
- Timeline with concrete next steps and owners

Important
If you cannot explain in one sentence what success looks like for this customer, the kickoff was not successful.`
  },
  {
    id: "a_onboarding_stalled_primary",
    canonicalId: "onboarding_stalled",
    title: "What if onboarding is delayed or stalled?",
    content:
`Short answer
When onboarding stalls, the root cause is usually misalignment on value or ownership, not tooling.

If onboarding is delayed, do the following:
- Reconfirm the success plan and expected outcomes
- Verify customer ownership (who is accountable on their side)
- Identify the exact blocker (decision, data, access, priority)
- Reset scope and timeline if assumptions have changed

Important
Silence or slow progress is a signal. Do not assume onboarding is “moving in the background”.`
  },
  {
    id: "a_risk_detection_primary",
    canonicalId: "risk_detection",
    title: "How do we know if an account is at risk?",
    content:
`Short answer
An account is at risk when expected value is not materializing, even if the customer hasn’t complained.

Treat an account as at risk when two or more of the following are true:
- Product usage is declining or flat over time
- Success plan milestones are delayed or missed
- Customer engagement is decreasing (missed calls, slow replies)
- ROI is unclear or cannot be articulated
- The internal champion has changed or disappeared

Important
Risk is often silent. Lack of complaints does not mean the account is healthy.`
  },
  {
    id: "a_risk_response_primary",
    canonicalId: "risk_response",
    title: "What should I do when I suspect an account is at risk?",
    content:
`Short answer
When you suspect risk, act early and re-anchor the relationship around value, not features or urgency.

Do the following before escalating:
- Validate whether the success plan is still aligned with current priorities
- Identify what has changed on the customer’s side (goals, ownership, timing)
- Reconfirm value realization and measurable outcomes
- Increase communication intentionally, not reactively

Avoid
- Overloading the customer with features
- Assuming silence equals progress
- Escalating without evidence

Important
Early, focused action often prevents escalation altogether.`
  },
  {
    id: "a_risk_escalation_primary",
    canonicalId: "risk_escalation",
    title: "When and how should we escalate a high-risk account?",
    content:
`Short answer
Escalate when the risk cannot be mitigated through CSM-led actions and the potential impact is material (renewal, expansion, reputation).

Escalation is appropriate when one or more apply:
- The customer’s business outcome is blocked beyond the CSM’s control
- There is a credible churn or downgrade risk
- Critical stakeholders are disengaged or unavailable
- Commitments cannot be met without cross-functional support

How to escalate correctly:
- Document the facts (signals, timelines, missed milestones)
- State what has already been tried and with what result
- Be explicit about what help is needed (decision, resources, exec alignment)
- Align internally before involving the customer

Important
Escalation is a tool to increase success, not a signal of failure.`
  },

  // =========================
  // FOLLOW-UP ANSWERS
  // =========================

  // Onboarding completion follow-ups
  {
    id: "a_fu_onb_first_value",
    canonicalId: "onboarding_completion",
    title: "What counts as first value?",
    content:
`Short answer
“First value” means the customer has used tgndata to make (or confidently support) a real pricing decision — and they acknowledge it.

Examples that count:
- They identify overpriced/underpriced items and take action (or approve a plan)
- They confirm competitor monitoring is accurate enough to rely on
- They use an insight in a weekly/monthly routine (not a one-off click)

What does NOT count:
- Data was delivered, but nobody used it
- Setup is done, but outcomes are still vague
- Only the CSM believes value happened

Quick test
Ask: “What decision did you make this week using tgndata?” If there’s no answer, first value didn’t happen yet.`
  },
  {
    id: "a_fu_onb_to_adoption",
    canonicalId: "onboarding_completion",
    title: "When do we transition from onboarding to adoption?",
    content:
`Short answer
You transition when the customer can run core workflows without you and the success plan has a working cadence.

Practical criteria:
- 1–2 core workflows are repeatable by the users (not just watched in a demo)
- Owners are clear on both sides
- First value is achieved (or is scheduled with a hard date + blocker removed)
- A recurring cadence call exists with agenda + action items

Rule of thumb
Onboarding = getting to first verified value.
Adoption = repeating that value reliably without hand-holding.`
  },
  {
    id: "a_fu_onb_document_completion",
    canonicalId: "onboarding_completion",
    title: "How do we document onboarding completion?",
    content:
`Short answer
Document onboarding completion by recording (1) success criteria, (2) what was verified, and (3) the operating rhythm going forward.

Minimum you must capture:
- Customer outcomes + success criteria (how we measure)
- What “first value” was and how it was verified
- Current scope (what’s in/out)
- Stakeholders + owners
- Next milestone + timeline + action items
- Cadence schedule + meeting name + agenda format

If it’s not written down in one place, it didn’t happen — it’s just vibes.`
  },

  // Kickoff follow-ups
  {
    id: "a_fu_kickoff_red_flags",
    canonicalId: "kickoff_outcomes",
    title: "What are common kickoff red flags?",
    content:
`Short answer
Kickoff red flags are signals that you don’t have real alignment — you have polite agreement.

Red flags:
- No clear owner on the customer side (“we’ll see internally”)
- Goals are generic (“be more competitive”) with no metric/timeline
- Stakeholders missing (decision-maker absent) and nobody cares
- Scope is fuzzy (“we want everything”) or constantly changing
- Customer expects tgndata to “just work” without providing inputs/data/access
- No commitment to cadence / next meeting date

What to do immediately:
- Force clarity: owners, timeline, success criteria, next milestone.
If you can’t get those, you’re not onboarding — you’re waiting.`
  },
  {
    id: "a_fu_kickoff_document",
    canonicalId: "kickoff_outcomes",
    title: "What should be documented after the kickoff?",
    content:
`Short answer
Right after kickoff, document the “contract of collaboration”: outcomes, scope, owners, and next steps.

Checklist:
- Business problem + desired outcomes
- Success criteria (metrics + how verified)
- Scope (in/out) + assumptions
- Stakeholders + decision-maker + working team
- Timeline milestones (first value date) + owners per action
- Cadence schedule (recurring meeting booked)

If the notes can’t be sent as a 1-pager and understood, you left the kickoff too early.`
  },
  {
    id: "a_fu_kickoff_success_plan",
    canonicalId: "kickoff_outcomes",
    title: "How does the kickoff feed into the success plan?",
    content:
`Short answer
Kickoff defines the “why” and “what”; the success plan turns it into a “how” with initiatives and measurable milestones.

Mapping:
- Kickoff outcomes → Success plan objectives
- Success criteria → KPIs/verification points
- Scope + assumptions → initiatives + risks
- Owners → DRI per initiative
- Timeline → milestones + cadence agendas

Key point
If kickoff ends without enough info to draft v1 of the success plan, kickoff wasn’t complete.`
  },
  {
    id: "a_fu_kickoff_who_involved",
    canonicalId: "kickoff_outcomes",
    title: "Who needs to be involved in the kickoff call?",
    content:
`Short answer
At least one decision-maker + one day-to-day owner must be there. Otherwise you’re presenting, not onboarding.

Customer side:
- Decision-maker (approves scope/time/budget priorities)
- Operational owner (will run workflows weekly)
- Data/tech contact (if integrations/data delivery matter)

tgndata side:
- CSM (DRI)
- Sales/AE (handoff context + expectations)
- Specialist (only if needed: data, integrations, complex scope)

If the decision-maker is missing, book a follow-up with them — don’t pretend it’s fine.`
  },

  // Onboarding stalled follow-ups
  {
    id: "a_fu_stall_root_cause",
    canonicalId: "onboarding_stalled",
    title: "How do we identify the root cause of onboarding delays?",
    content:
`Short answer
Find the single blocking constraint: decision, data, access, ownership, or priority.

Do this in order:
1) Re-state the agreed outcome in one sentence (confirm they still want it)
2) Ask: “What is the next step that is not happening — and why?”
3) Categorize the blocker:
   - Decision (waiting for approval)
   - Data/access (missing inputs/credentials)
   - Ownership (no DRI on their side)
   - Priority (they deprioritized you)
4) Reset a timeline with dates + owners, or explicitly downscope.

If you can’t name the blocker, you’re not managing onboarding — you’re observing it.`
  },
  {
    id: "a_fu_stall_reset_timeline",
    canonicalId: "onboarding_stalled",
    title: "How do we reset onboarding timelines with the customer?",
    content:
`Short answer
Reset the timeline by renegotiating scope + outcomes, then locking next steps with dates.

Script structure:
- “Here’s what we agreed success looks like… is this still true?”
- “Here’s what’s blocked and what we need from your side…”
- “Given this, we can either (A) keep scope and shift timeline, or (B) reduce scope and keep timeline.”
- “Let’s pick one and book the next session now.”

Never leave it as “we’ll get back to you”. That’s how onboarding goes to die.`
  },

  // Risk detection follow-ups
  {
    id: "a_fu_risk_check_first",
    canonicalId: "risk_detection",
    title: "What should I check first when I suspect risk?",
    content:
`Short answer
Start with: value, engagement, and ownership — in that order.

Check:
- Value: did they achieve the last milestone? can they state ROI?
- Engagement: are they attending calls / replying / logging in?
- Ownership: is the champion active or did they disappear/change?

Then inspect:
- Success plan slippage (missed dates)
- Product usage trend (flat/declining)
- Open issues affecting trust (data quality, coverage gaps)

If you don’t know what “healthy” looks like for this account, you can’t detect risk — you can only panic.`
  },
  {
    id: "a_fu_risk_renewal_impact",
    canonicalId: "risk_detection",
    title: "When does risk start to affect renewals?",
    content:
`Short answer
When the customer can’t articulate value 60–90 days before renewal, you have a renewal problem.

Practical thresholds:
- No verified value by mid-term → high risk
- Missed milestones + declining engagement → renewal risk
- Champion changed + no new owner → urgent
- “We’ll review later” near renewal → you’re already late

The goal
By the time renewal talk starts, the story of value should already be obvious — not invented.`
  },
  {
    id: "a_fu_risk_document_track",
    canonicalId: "risk_detection",
    title: "How should risk be documented and tracked internally?",
    content:
`Short answer
Track risk like an incident: signals, impact, actions, owners, and deadlines.

Minimum:
- Risk level (low/med/high) + why
- Signals (usage, engagement, milestones, ROI clarity)
- Customer narrative (what they believe is happening)
- Actions taken (what, when, by whom) + outcome
- Next action + owner + due date
- Escalation criteria (what would trigger leadership)

If it’s not tracked, it will be re-discovered every week like it’s new.`
  },

  // Risk response follow-ups
  {
    id: "a_fu_risk_reanchor_value",
    canonicalId: "risk_response",
    title: "How do I re-anchor the conversation around value?",
    content:
`Short answer
Stop talking about features. Talk about decisions and outcomes.

Do:
- Re-state their goal and the success metric
- Ask what changed (priority/owner/timing)
- Propose a single next milestone that proves value fast
- Tie next steps to a concrete decision they care about

Avoid:
- “Let me show you more parts of the platform”
- “Maybe you should explore X feature”

If they can’t name a decision tgndata helps them make, you’re selling again — not succeeding.`
  },
  {
    id: "a_fu_risk_document_actions",
    canonicalId: "risk_response",
    title: "How do I document risk-related actions?",
    content:
`Short answer
Document actions as a tight action log, not a story.

Template:
- Problem statement (1–2 lines)
- Evidence (signals + dates)
- Action taken (what/when/owner)
- Customer response
- Result (moved signal? yes/no)
- Next action + due date + escalation trigger

If actions aren’t documented, you’ll repeat them — and call it “trying”.`
  },

  // Escalation follow-ups
  {
    id: "a_fu_escalation_prepare_info",
    canonicalId: "risk_escalation",
    title: "What information should I prepare before escalating?",
    content:
`Short answer
Bring facts, not feelings.

Prepare:
- Account context + renewal date + $ impact
- Success plan milestones and what’s missed
- Risk signals (usage, engagement, ROI clarity)
- What’s already been tried + outcomes
- What you need from leadership (decision, pressure, resources)
- Recommended next move (internal + customer-facing)

If you escalate without a clear ask, you’re just forwarding anxiety.`
  },
  {
    id: "a_fu_escalation_who_involved",
    canonicalId: "risk_escalation",
    title: "Who needs to be involved in an escalation?",
    content:
`Short answer
Only people who can change the outcome should join.

Usually:
- CSM (DRI)
- Sales/AE (commercial context)
- Team lead / Head of CS (authority + prioritization)
- Engineering/Data lead (if delivery blockers exist)

Customer side (only if needed):
- Decision-maker / exec sponsor

Rule
More people ≠ more pressure. More people usually means more confusion.`
  },
  {
    id: "a_fu_escalation_internal_vs_external",
    canonicalId: "risk_escalation",
    title: "How do I communicate escalation internally vs externally?",
    content:
`Short answer
Internally: blunt and factual. Externally: calm, outcome-focused.

Internal message:
- “Here are the signals, the impact, what we tried, and what we need.”

Customer message:
- “We’re bringing in extra support to unblock X outcome by Y date.”

Never tell the customer “we escalated you” σαν να είναι καταγγελία.`
  },
  {
    id: "a_fu_escalation_after",
    canonicalId: "risk_escalation",
    title: "What happens after an escalation is initiated?",
    content:
`Short answer
An escalation must end with a decision, not an ongoing meeting series.

After escalation:
- Assign a single DRI
- Define success criteria + deadline
- Create an action plan with owners
- Communicate next steps to customer (if applicable)
- Review progress frequently until closed

If escalation doesn’t create speed and clarity, it’s just a louder status meeting.`
  },
];
# Workbench fast path: right-size the process, run it from the conversation

*Proposal, 2026-10-16. **Approved by the Owner 2026-10-17 with two changes, and folded into [gen2-crew.md](gen2-crew.md) §17–§20 (D41–D47):** the tracks are named **Low / Medium / High complexity**, rated by the platform against expert-agent capability and run length; and **Low simply ships** (no "Ship it" tap), always through the TDD plane. gen2-crew.md is authoritative; this file keeps the review and reasoning.*

## 1. The problem, from the code

Every change, however small, runs the same eight-stop rail (`RAIL` in `packages/domain/src/flywheel.ts`). `workActions()` only offers the next stop once the previous one is approved, so a one-line copy fix needs:

| # | What the Navigator does | What runs |
|---|---|---|
| 1 | Types the request | `discuss` job (runner, cold agent) |
| 2 | Presses **Draft the design** | `design` job |
| 3 | Presses **Approve design** | — |
| 4 | Presses **Write the plan** | `plan` job (2–8 steps, by prompt rule) |
| 5 | Presses **Approve plan** | — |
| 6 | Presses **Build step N** (once per step, unless cadence is changed) | `build_step` job per step |
| 7 | Presses **Prove and preview** | `prove` job |
| 8 | Presses **Approve for release** | — |
| 9 | Presses **Go live** | `release` job |
| 10 | Presses **Close #n** | — |

That's about 10 presses and 6+ runner jobs. Each job is queued in Postgres, picked up by a runner that polls every 2–5 s (`apps/runner/src/main.ts`), and starts a fresh Agent SDK session that rereads the repo. The console polls every 2.5 s.

Five design flaws sit underneath:

1. **One process for every change.** The domain already has a proportionate policy, but the rail ignores it. `requiredGates()` (`gates.ts`) lets AC1 display/content changes ship on evidence, and Owner approval only applies to money/data/auth/security. `workActions()` never calls it. §13.1 already says "a text correction should not trigger the same ceremony as a payment change"; the code doesn't do that.
2. **The client approves the crew's internal steps.** Approving the plan and pressing each build step are project management. §10.1 says the executive "must not … sequence their tasks" and "routine internal steps stay within the approved mandate". The rail makes them do exactly that.
3. **Chat can't act.** The lead's prompt tells it to say "Ready to draft the design?", but it has no tool to do it. The person then has to find the right button in the "Needs you" bar. So the conversation and the controls are two separate interfaces.
4. **The screen shows everything at once.** Delivery Studio stacks a hero summary, a lens switcher, Replay, a motion toggle, a decision-access banner, the activity ribbon, the rail, "Needs you", the thread and four document tabs. The next decision is one of about 15 regions.
5. **Every reply is a batch job.** Even a conversational answer goes through the job queue and a cold agent start, so the conversation feels slow and the person waits on infrastructure, not on thinking.

## 2. The proposal in one paragraph

**Talk to the lead the way you'd talk to Claude. It picks a process sized to the change, does the work on its own, and stops only for real decisions.** Each decision appears in the chat as one card. Answer it by tapping the button or typing "approve" or "ship it". A slim side bar shows where the work stands. Gates, tenancy, proof and the Owner's authority stay exactly as strict as they are today. What goes away is the ceremony around them.

## 3. Recommendations

### R1. Three tracks instead of one rail (the biggest single gain)

At intake, the lead classifies the request. Deterministic policy, not the model, then fixes the track. The rail stops still exist; a track decides which ones are client-visible and which ones need a decision.

| Track | Typical work | Client decisions | What the crew does unprompted |
|---|---|---|---|
| **Quick** | Copy, styling, a small fix; display/content risk only; one capability | **One:** "Ship it" on the preview. At AC1, `requiredGates()` may allow evidence-only release; recommend still asking for one tap until trust is earned | Build + tests + prove + preview in **one job** |
| **Standard** | A feature or behavior change, no protected risk class | **Two:** approve the **Brief** (design and plan merged, one screen), then "Ship it" on the preview | Plans internally, builds every step, proves and previews without stopping |
| **Governed** | Money, data, auth or security; schema changes; several capabilities; anything on the protected-rule register | Today's full rail: design, plan, Try and Owner approval. Nothing is relaxed | As today |

Rules that keep it safe:
- **The track only ever goes up automatically.** If a build touches a protected path, a migration, a risky class or a rule-register entry, the run pauses and the item moves up a track with a card explaining why. Moving down needs a person, and never below the policy floor.
- **The client can always ask for more process** ("treat this as a big one", "show me the plan first").
- `workActions()` is rebuilt around `track` and calls `requiredGates()`. The 3 tracks replace the cadence select. The Protocol (`protocolVerdict`, `proveVerdict`, `releaseVerdict`) stays and still blocks bad steps. Only who has to press what changes.
- The prompts change to match: "Design before code" and "one plan step per run" apply to Standard and Governed only. A Quick job is told to make the change, add or adjust tests (or give `NO_TESTS_REASON`), and prove it.

### R2. The plan is the crew's, the Brief is the client's

For Standard, merge design.md and the plan into one **Brief**: goal, what changes, what stays protected, how it will be proven, risks, and an estimate. It is a single approval. The step list is still generated and checkpointed, but it's crew-internal: shown in the side bar, never approved step by step. Governed keeps separate design and plan approvals, as §10.1 requires for protected work.

### R3. Chat is the control surface; every decision is a card in the thread

- The lead gets **typed tools** (in the API, under the same authorization as the buttons today): `propose_brief`, `start_build`, `request_preview`, `propose_release`, `pause`, `change_track`. It can then act when the person says "go ahead", instead of telling them which button to find.
- Each pending decision appears **inline in the conversation** as a card: what it is, recommendation, evidence, who can decide, a primary button, and "or type *approve*".
- **Typed approval is still a typed server action** (§10.2), not "conversational enthusiasm":
  - A reply like "approve", "yes ship it" or "go" resolves only when exactly one decision card is pending and the person is eligible.
  - The approval binds to that card's artifact or candidate version; a stale card is rejected.
  - Anything ambiguous gets a one-line question back.
  - **Owner-gated decisions (money/data/auth/security) still need the card's button.** A confirm step names the risk. Recommendation: never accept typed approval for these.
- "Stop", "wait" or "pause" in chat halts dispatch immediately, without a hunt for a control.
- The "Needs you" bar, the per-step **Build step N** buttons, **Draft the design**, **Write the plan** and the cadence select are removed. Each becomes either something the lead does on its own or a card.

### R4. Run by default; stop only at decisions

Within an approved Brief (or a Quick request), the crew runs to the next decision without being prompted: all steps, then prove, then preview. It reports progress in one updating message ("Step 2 of 4 done · tests 248/248"), not one message per step. A failed Protocol check makes the lead attempt a scoped repair within its retry budget (§14.3) before it escalates, so the person sees "fixed a failing test" rather than a blocked-step button.

### R5. One side bar shows where we are

It replaces the rail, "Needs you", the lens switcher and the four tabs as the default view.

```
┌ Conversation ─────────────────────────────┬ Where we are ─────────────┐
│ You: the footer link to Returns is broken │ #14 Fix Returns link      │
│ Lead: Found it: wrong path in footer.tsx. │ Track: Quick  (change)    │
│   Quick fix + a test. Starting.           │ ✓ Understood              │
│ Lead: Preview is up. Link works on        │ ✓ Built · tests 241/241   │
│   desktop and mobile; screenshot ▸        │ ✓ Proven · preview ▸      │
│ ┌ Decision · Ship #14 to production ─┐    │ ● Ship it ← you           │
│ │ Evidence ▸  Diff ▸  Preview ▸       │    │ ○ Live check              │
│ │ [ Ship it ]   or type "ship it"     │    │ Spend $0.42 · 4 min       │
│ └─────────────────────────────────────┘    │ Pause · Details ▸         │
└───────────────────────────────────────────┴───────────────────────────┘
```

- **Artifacts open in a drawer** from links in the conversation (Brief ▸, Diff ▸, Preview ▸, Evidence ▸) rather than living in permanent tabs.
- **Details ▸** keeps the existing Mission Control, Proof Lab, Replay and live log for people who want them. They stay, but they're no longer the default view.
- On mobile, the side bar collapses to a one-line status chip above the composer.

### R6. Make the conversation feel immediate

- **Stream the lead's replies from the API.** Conversational turns don't need the runner. Answering, clarifying and proposing a Brief can read the repo through a cached site map (the §14.4 execution map) or a GitHub read. The runner is reserved for jobs that edit or execute code.
- **Keep one agent session per Work item.** Resume it (Agent SDK session id) instead of cold-starting per job, and keep the worktree warm between steps.
- **Push events instead of polling.** Use SSE from the API to the console. The runner claims jobs by notification (Supabase realtime or `LISTEN/NOTIFY`), with polling kept as the fallback.

### R7. One composer, everywhere

A person shouldn't have to create a Work item to ask a question. Have one global "Ask the crew" composer, on Overview and site pages, plus `⌘K`. The lead answers questions directly and opens a Work item (with its track) only when the request needs a change. Slash commands give power users shortcuts: `/ship`, `/pause`, `/preview`, `/track governed`, `/status`.

### R8. Optional standing approval for Standard work

On a Standard Brief, the client may tick **"Ship automatically when proof is green and nothing escalates."** This is a recorded, versioned mini-mandate (§10.1), bound to that Brief's version. If any input changes, it is revoked. It is never available on Governed work, and it never overrides Owner gates. The default is off.

### R9. Measure it

Add per-item counters for client decisions, client presses, time to first preview, time to live, human-minutes waiting and send-backs. Report them per track on the Briefing. Targets to prove on Machine Shop (10 items per track):

| | Today (from code) | Quick target | Standard target |
|---|---|---|---|
| Client presses to live | ~10 | 1 | 2 |
| Runner jobs | 6+ (one per step) | 1 build+prove, 1 release | 1 per approval boundary |
| Time to first preview | depends on how fast the person clicks | < 5 min after the request | < 20 min after Brief approval |

The "10× to 50×" outcome is in human attention per change: about 10 decisions and waits come down to 1 or 2. We should claim the multiple only once these counters show it.

## 4. What gets ripped out and what stays

**Remove or replace:**
- `NeedsYou` and most of `work-room.tsx`'s tab and panel cascade (≈1,500 lines). It becomes Conversation + Decision cards + Side bar + Artifact drawer.
- The cadence select and the `cadence` column; `track` replaces them.
- The client-facing `draftDesign`/`draftPlan`/`approvePlan`/`runNextStep` actions and their routes. They become lead tools and crew-internal transitions, except on Governed.
- The `discuss` runner job, replaced by API-streamed lead turns.
- The default view's hero, lens bar and motion toggle, which move under Details.

**Keep unchanged:**
- `gates.ts` (now actually used), `canApprove`, decision access (`decision-access.ts`), closure rules (`work-closure.ts`) and tenancy.
- `protocolVerdict`, `proveVerdict` and `releaseVerdict`, plus all evidence records and their invalidation rules (a changed Brief or candidate invalidates approvals).
- The rail stops as the record of what happened, the Library and timeline, and the Owner gates.

## 5. Build order (each phase ships green on Machine Shop)

1. **F1: tracks and auto-run (largest gain, smallest change).**
   - Add `track` to `acc_work` and a pure `trackFor()`/`escalate()` in the domain with tests. Rewrite `workActions()` around tracks and `requiredGates()`.
   - Quick = one build+prove job. Standard = Brief → run all steps → prove.
   - Keep today's UI, but show only the one decision that applies.
2. **F2: chat as the controller.** Decision cards in the thread, lead tools, typed approval resolution with version binding, pause in chat. Remove "Needs you", the cadence select and the step buttons.
3. **F3: side bar and drawer.** Add the new default layout and move the lenses under Details.
4. **F4: speed.** API-streamed lead turns, persistent session per item, SSE events, notified job claims.
5. **F5: global composer, slash commands and standing approval (R7, R8).**

## 6. Decisions needed from the Owner

1. **Approve the three tracks** (R1), including that the track only goes up automatically. *Recommended: yes.*
2. **Quick track release:** one "Ship it" tap, or evidence-only release at AC1 as `requiredGates()` already allows? *Recommended: one tap for now; evidence-only after 10 clean Quick releases on Machine Shop.*
3. **Typed approval** ("approve", "ship it") for non-Owner-gated decisions, with buttons always available. *Recommended: yes. Owner-gated decisions stay button plus confirm.*
4. **Drop the client-visible plan approval on Standard** in favor of a single Brief (R2). *Recommended: yes.*
5. **Standing "ship when green" approval** on Standard (R8). *Recommended: build it in F5, default off.*

## 7. Design-document changes on approval

- **§10.1:** replace "Existing cadence, AC levels and design/plan/Try/release gates remain enforced … Any future reduction in gate frequency needs an explicit policy design and Owner approval" with a reference to the track policy. This proposal is that policy design.
- **§10.2:** typed decisions now include version-bound typed approvals in the conversation, with the eligibility rules in R3.
- **§13.1:** "review depth follows business risk" becomes enforced through tracks.
- **§15/§16:** the default Delivery Studio view is Conversation + Side bar. The other lenses move under Details.
- **flywheel.md F4 (three gates):** amend so it applies to the Governed track. Quick and Standard follow R1.
- **The Protocol in `prompts.ts`:** add per-track wording.

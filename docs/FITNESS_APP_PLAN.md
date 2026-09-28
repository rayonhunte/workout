# FITNESS_APP_PLAN

Implementation brief for [rayonhunte/workout](https://github.com/rayonhunte/workout)

Prepared: 2026-09-28. Intended repository location: `docs/FITNESS_APP_PLAN.md`.

## 1. Instructions to Codex

Inspect the existing workout application before changing it. Evolve it into a personal 12-week strength, muscle-preservation, functional-fitness, cardio and progress tracker. Preserve useful architecture, screens, features, authentication and historical data. Avoid rebuilding unnecessarily.

First inspect repository instructions, dependencies, routes, existing workout flows, tests, Firebase configuration, authentication, security rules, indexes and actual data-access code. Establish which Firebase products and data structures are in use before proposing changes. The prior conversation identified Firebase project `allwork-e32b6`; treat that as context to verify, not authorization to change a live project.

Use this document as the source of truth for implementation. Keep it updated as decisions are made. Record discovered constraints, schema mappings and deviations here. Deliver working increments, with validation and clear notes about what remains. Do not replace historical records or run destructive migrations to fit a new model.

### Source fidelity and unresolved details

This brief captures the retrieved **Diabetes Fitness Plan** conversation and the user's explicit request. Phase 1 A/B/C and the Phase 3 A example below are transcribed from that plan. The conversation specified Phase 2 principles but not a complete exercise-by-exercise prescription; it did not specify Phase 3 B/C. Those gaps are identified below with conservative, editable implementation defaults. Do not present proposed defaults as an agreed clinical or coaching prescription.

The repository has not been audited as part of preparing this document. Schema suggestions are conceptual, not claims about its current implementation. Example weights from the conversation were illustrative, not measured baselines; do not seed them as workout history.

## 2. User profile and goals

Personal profile values from the supplied brief are intentionally redacted from this repository copy. Age, height, starting weight, target weight, health context, medication notes, movement limitations and eating notes belong in editable, private user settings. No personal profile or historical measurements are seeded. The original supplied file remains outside the repository.

Default program availability is three nonconsecutive lifting days, after 11 AM, with up to 90 minutes per session and optional easy activity. Users can edit this schedule. Do not infer doses, glucose thresholds, laboratory results or medical clearance.

Success is broader than reaching a target weight: show waist trends, maintained or improved strength, work capacity and consistency. Do not promise a particular weight or glucose outcome by Week 12.

## 3. Schedule and 12-week structure

| Day | Default activity |
| --- | --- |
| Monday | Workout A — full-body strength, approximately 75–85 minutes |
| Tuesday | Active recovery: 20–40 minute walk |
| Wednesday | Workout B — full-body and functional, approximately 75–90 minutes |
| Thursday | Active recovery: walking and/or mobility |
| Friday | Workout C — muscle and strength, approximately 75–90 minutes |
| Saturday or Sunday | Optional 30–45 minutes walking, cycling, swimming, mobility or recreation |

Keep main lifting days nonconsecutive when rescheduling. Optional day four is initially easy activity, not an extra hard lifting workout. Let the user move or skip sessions without losing their place or creating overdue-session pressure.

| Phase | Weeks | Objective | Effort |
| --- | --- | --- | --- |
| Foundation | 1–4 | Relearn movements, establish technique, manage soreness | Approximately 2–3 reps in reserve (RIR) |
| Build | 5–8 | Gradually increase resistance and useful training volume | Approximately 1–2 RIR |
| Strength / performance | 9–12 | Heavier primary lifts and greater functional capacity | No maximal attempts; proposed default 1–2 RIR |

RIR means the number of additional good-form repetitions the user believes they could complete. Explain it briefly in the interface. A missing RIR is unknown, not zero.

A typical session includes 8–10 minutes warm-up, resistance exercises, functional work and moderate cardio. The full exercise list may exceed the time budget depending on rest and setup. Display elapsed time; allow shortening cardio or skipping accessories with a recorded reason. Never encourage rushing heavy sets to meet 90 minutes.

## 4. Foundation workouts: Weeks 1–4

Use these as seed templates. Loads are chosen by the user based on good technique and the RIR target; do not prescribe starting weights.

Warm up before every session: 8–10 minutes of easy walking or similar activity, hip mobility, shoulder circles and comfortable bodyweight squats. Allow separate warm-up/ramp-up sets for lifts; exclude those from prescribed working-set counts.

### Workout A — Strength foundation

| Exercise | Working sets | Target |
| --- | ---: | --- |
| Leg press | 3 | 10 reps |
| Dumbbell bench press | 3 | 8–12 reps |
| Seated cable row | 3 | 10–12 reps |
| Romanian deadlift | 3 | 8–10 reps |
| Lat pulldown | 3 | 10–12 reps |
| Dumbbell lateral raise | 2 | 12–15 reps |
| Farmer carry | 3 | 30 seconds |

Finish with 10–15 minutes moderate incline treadmill walking.

### Workout B — Functional strength

| Exercise | Working sets | Target |
| --- | ---: | --- |
| Goblet squat | 3 | 10 reps |
| Machine chest press | 3 | 10 reps |
| Cable row | 3 | 10 reps |
| Step-ups | 3 | 8 reps each leg |
| Dumbbell shoulder press | 2 | 10 reps |
| Cable chop | 3 | 10 reps each side |

Functional block:

- Sled push: 4 rounds of 20–30 metres, resting 60–90 seconds between rounds.
- Suitcase carry: 3 rounds, each including 30 seconds left and 30 seconds right.

Finish with 10–15 minutes cycling or elliptical.

### Workout C — Muscle and strength

| Exercise | Working sets | Target |
| --- | ---: | --- |
| Leg press OR hack squat | 3 | 10–12 reps |
| Incline dumbbell press | 3 | 8–12 reps |
| Lat pulldown | 3 | 8–12 reps |
| Dumbbell Romanian deadlift | 3 | 10 reps |
| Cable row | 2 | 10–12 reps |
| Dumbbell curl | 2 | 10–15 reps |
| Triceps pressdown | 2 | 10–15 reps |
| Farmer carry | 3 | 30–45 seconds |

Finish with 15–20 minutes incline walking. Leg press and hack squat are alternatives, not two required exercises.

### Rest and alternatives

The original plan did not provide all rest periods. Proposed editable defaults: 90–180 seconds for demanding compound lifts and 60–90 seconds for accessories and carries; retain the stated sled rest. Rest longer when needed to recover and maintain form.

Support exercise substitutions with separate history and visible labels. Functional movement categories include carries, sled push/pull, squat, hinge, single-leg work, rotation and anti-rotation. Sled pull, split squat and Pallof press were discussed as possible variations, not additional required work. Do not silently add them to the base workouts.

## 5. Build phase: Weeks 5–8

Preserve the A/B/C structure. The original plan calls for primary exercises moving toward 3–4 working sets, approximately 1–2 RIR and gradual resistance increases.

Proposed implementation defaults, pending user review:

- Begin with Phase 1 exercise selection and rep ranges. Keep accessory prescriptions unchanged.
- Offer an optional fourth set on the first lower-body exercise and first press in each session when recovery and time allow. Do not increase every exercise to four sets automatically.
- Progress farmer carries from 30 toward 45 and then 60 seconds as tolerated; retain the number of sets unless edited.
- Offer sled progression from 4 toward 5 and then 6 rounds, retaining 20–30 metres per round and 60–90 seconds rest.
- Keep suitcase carries at the base prescription unless the user changes them.
- Increase post-lifting cardio gradually toward 15–25 minutes within the session limit. Show this as a target range, not mandatory extra time.

These changes are suggestions that the user can accept, defer or edit. Calendar advancement alone must not force extra load or volume.

## 6. Strength / performance: Weeks 9–12

The conversation gave this specific **Workout A example**:

| Exercise | Working sets | Target |
| --- | ---: | --- |
| Leg press | 4 | 6–8 reps |
| Dumbbell bench press | 4 | 6–8 reps |
| Cable row | 3 | 8–10 reps |
| Romanian deadlift | 3 | 8 reps |
| Lat pulldown | 3 | 8–10 reps |
| Farmer carry | 4 | 45 seconds |
| Cardio | — | 15 minutes |

The example omitted lateral raises; preserve them as an optional accessory rather than a required addition. No one-repetition-max testing or required failure training.

**B/C were not fully specified.** Proposed default: carry forward the user's last accepted Phase 2 B/C templates and 1–2 RIR target, with normal gradual progression. Label these as carried-forward templates. Allow reviewed changes to primary lifts, but do not invent mandatory heavier B/C prescriptions. Phase changes must preserve previous session targets and results.

After Week 12, offer a review of weight, waist, strength, carries, cardio, attendance and optional glucose observations. Let the user repeat or adapt the block; do not reset history.

## 7. Progression, recovery and cardio rules

- Use double progression: first improve reps within the range while maintaining form and target RIR; then suggest the smallest practical load increase when all working sets reach the top of the range. For fixed-rep exercises, reaching the prescribed reps at target RIR is the equivalent condition.
- The original dumbbell example progressed from 50 lb for 3 × 12 to 55 lb next time. This illustrates the method; do not hard-code a 5 lb increase for all exercises or users.
- Show the previous comparable performance and an editable suggestion. The user confirms their actual load. Never replace achieved results with a recommendation.
- If reps, technique or RIR deteriorate, allow repeating or reducing the load/volume. Skipped sets, incomplete sessions and missing RIR must not trigger automatic progression.
- For carries and sleds, progress one variable at a time: load, duration, distance or rounds. Keep left/right suitcase results distinct.
- Do not penalize missed sessions or generate catch-up double workouts. Allow repeating a week and deferring a phase transition.
- Keep initial cardio moderate and conversational; HIIT is not required. Log modality, minutes and optional distance/intensity. Active-recovery activity counts in weekly activity totals without inflating lifting-session completion.
- The conversation's longer-term aerobic aim was approximately 150 minutes per week, approached gradually. Treat that as a configurable plan target, not a quota to reach immediately or medical clearance.

## 8. Fast mobile workout logging

The primary flow is **Today → Start/Resume → Log set → Finish**. Use large touch targets, readable text, numeric keyboards and minimal navigation. Make previous results visible beside current targets. Prefill suggestions without marking them completed.

Required session data:

- Workout identity, program/phase/week, template version or target snapshot, local workout date and timestamps.
- In-progress/completed/partial/skipped status; start/end time and duration, with editable corrections.
- Ordered exercises, substitutions, per-exercise notes and session notes.
- Per-set actual reps, load and unit, optional RIR, completion state and warm-up/working-set designation.
- Timed/distance work: duration, distance and unit, rounds, load and side where applicable.
- Cardio modality and duration; optional distance, incline/resistance and perceived effort.
- Optional pre/post glucose entries, each with value, unit, timestamp and notes; allow extra readings without requiring them.

Support add/remove set, edit mistakes, undo accidental completion, skip exercise, resume after closing the app and browse exercise history. Store duration in a consistent unit and make paused versus elapsed time behavior clear. Use separate target and actual fields. An unlogged value is not a zero.

Distinguish per-dumbbell weight, total load, bodyweight and machine settings. For sleds specify whether load means added plates or total sled load. Do not combine incompatible equipment records into misleading personal records. Support lb/kg, inches/cm, metres and glucose units with explicit conversion and rounding rules.

Autosave safely. Show saving/saved/offline/error states. Preserve drafts through refresh or interrupted connectivity where the existing platform supports it, and prevent duplicate sessions on retry. Rest timers must not obstruct logging. Do not require a glucose entry or a long intake form to save a workout.

## 9. Progress tracking

- Body weight: weekly check-in by default; optional more frequent entries, date and lb/kg. Show trend toward the user’s editable goal without promising a completion date.
- Waist: monthly check-in, date and inches/cm; show change from the first actual measurement.
- Strength: exercise history and comparable sets for leg press, presses, rows, pulldowns and other lifts. Compare reps, load and RIR together. Avoid calling a heavier low-rep set equivalent to every lighter set.
- Carries: load, duration/distance, rounds and side. Cardio: weekly minutes, modality and optional distance/intensity trends.
- Consistency: completed and partial workouts, recovery activity and current program position.
- Glucose: optional timestamped before/after pairs and descriptive trends. Only calculate a workout change when readings are actually paired to that session; show sample count and missing data. Do not infer medication effectiveness or promise causal conclusions.
- Progress photos were optional in the conversation. Defer unless existing functionality makes them straightforward; require explicit opt-in and private storage.

Provide a Week 12 comparison using real logged baselines. No fabricated data in production. Nutrition context may appear as private notes; calorie planning, dietary prescriptions and medication management are outside the first implementation.

## 10. Glucose and medication safety UX

This is a fitness log, not a dosing tool or exercise-clearance system. Use brief, accessible safety information with expandable detail. Have health-related copy reviewed before release; preserve source links and a review date.

Gliclazide can cause low blood sugar, and exercise can increase that risk, including after activity. Provide reminders to keep glucose monitoring supplies and fast-acting carbohydrate available and to follow the user's clinician-provided monitoring and hypo plan. Never encourage training through suspected low glucose. [NHS gliclazide](https://www.nhs.uk/medicines/gliclazide/) · [NHS exercise and blood glucose](https://mydiabetesmyway.scot.nhs.uk/resources/app-resources/exercise-and-physical-activity-the-impact-on-blood-glucose/)

Empagliflozin safety content should cover dehydration and warning symptoms such as vomiting, abdominal pain, unusual tiredness/confusion or rapid/deep breathing, with advice to seek urgent medical assessment when these occur. Do not interpret a glucose reading as ruling out a serious problem. [NHS empagliflozin side effects](https://www.nhs.uk/medicines/empagliflozin/side-effects-of-empagliflozin/)

Implementation requirements:

- Do not recommend changing, skipping, stopping, rescheduling or adjusting medication. Do not calculate doses or carbohydrate compensation from medication names.
- Glucose entry is optional. Missing readings must never become a green “safe to train” result; a recorded reading also does not establish clearance.
- Provide “Pause workout,” “Log symptoms/reading” and easy access to the user's clinician-provided safety plan. For severe symptoms, unconsciousness or inability to swallow safely, direct to local emergency help. Do not hard-code another country's emergency number.
- Do not copy a universal exercise-start threshold from the old discussion into an automatic decision engine. Any numeric alert thresholds and treatment instructions require a separately reviewed specification with explicit units and intended population. Initial delivery can use contextual reminders and a stored personal safety plan.
- Support mg/dL and mmol/L; display the selected unit beside every entry, chart and alert. Validate implausible entries without silently changing their unit.
- Do not recommend fasting or intensifying carbohydrate restriction to accelerate weight loss. Keep the reported low-carb/low-GI pattern as context, and direct individualized dietary and exercise safety questions to the diabetes care team.
- Keep safety reminders available without repeated modal interruptions during routine logging. Symptoms should take precedence over celebratory completion or progression prompts.

## 11. Architecture, data and migration requirements

Map the concepts below onto the current model before deciding on new collections, tables or documents:

| Concept | Needed responsibility |
| --- | --- |
| Profile/preferences | Units, schedule, goals, optional private health context |
| Exercise catalog | Stable IDs, equipment, measurement type, load convention and alternatives |
| Program/templates | 12-week phases, A/B/C targets, editable versions |
| Program enrollment | Start date, active week, accepted changes, paused/repeated weeks |
| Workout sessions | Target snapshot and actual sets, status, timing, notes and sync identity |
| Measurements | Timestamped body weight and waist |
| Activity/glucose | Recovery/cardio records; optional session-linked glucose readings |

Use existing technology and conventions when suitable. Avoid unnecessary dependencies. Separate planned templates from performed sessions; later template edits must not rewrite history. Preserve stable IDs and ownership checks. Store time instants consistently and preserve the intended local workout date/timezone for weekly summaries.

Before schema changes, document old-to-new mappings, optional fields, defaults, required indexes, compatibility and rollback. Prefer additive changes. Rehearse migrations against fixtures or an emulator; ensure repeat runs are idempotent and verify counts and representative records. Use a backup/export before any production data migration. Never delete legacy data merely because the new UI does not use it.

Review per-user Firebase access rules and storage rules where relevant. A signed-in user must not read or write another user's workouts or health records. Keep credentials out of source control. Do not send glucose, medication or personal notes to analytics/crash logs. Do not add external health-data sharing. Inspect existing export/deletion features and preserve them.

## 12. Staged implementation checklist

### Stage 1 — Inspect and map

- [x] Read repository guidance and run the existing application/checks.
- [x] Inventory reusable screens, logging, auth, Firebase products, schemas, rules and indexes.
- [x] Verify project configuration without changing production resources.
- [x] Record the smallest implementation approach and any genuinely blocking questions.
- [x] Record which Phase 2/3 defaults remain proposals; keep them editable and visible.

### Stage 2 — Program and persistence

- [x] Map program/templates/sessions onto the current data model.
- [x] Add A/B/C Phase 1 templates, Phase 2 progression settings and the specified Phase 3 A example.
- [x] Implement clearly labeled carried-forward Phase 3 B/C defaults and versioned session targets.
- [x] Seed idempotently; do not create fake completed workouts or overwrite user edits.
- [x] Implement and validate any additive migration, compatibility, rules and indexes.

### Stage 3 — Core gym workflow

- [x] Build mobile Today, Start/Resume, set logging and Finish flows.
- [x] Support reps, load, RIR, timed/distance work, sides, cardio, notes and duration.
- [x] Show previous performance, editable suggestions and optional rest timers.
- [x] Preserve drafts, edits, partial completion and safe retry behavior.
- [x] Implement rescheduling, skipped sessions and repeat/defer-week controls.

### Stage 4 — Progress and safety

- [x] Add weight, waist, strength, carries, cardio and consistency views.
- [x] Add optional glucose input with explicit units and carefully paired summaries.
- [ ] Clinical review of medication-aware reminders before release. Source-linked reminders and private safety-plan access are implemented.
- [x] Add Week 12 review; defer optional photos unless already supported.

### Stage 5 — Validate and hand over

- [x] Run relevant existing checks and focused tests of progression, units, persistence and authorization.
- [x] Verify on a narrow mobile viewport using realistic A/B/C sessions.
- [x] No migration required: legacy fixture ownership tested; rollback leaves new records intact.
- [x] Existing UI navigation and legacy ownership verified with emulator fixtures. Real production records were not accessed.
- [x] Update this document with implemented behavior, deviations and remaining items.
- [x] Report validation results and unresolved limitations; keep deployment separate from implementation unless authorized.

## 13. Acceptance criteria

1. An existing user can sign in and access prior data and useful existing features after the update.
2. The program shows all 12 weeks, three main sessions per week, optional recovery activity and editable scheduling after 11 AM. Phase 1 matches the tables; later proposed defaults are identified accurately.
3. On a phone, a returning user can open Today and start/resume a workout within two primary actions. Logging a prefilled set requires one completion action, with corrections directly accessible.
4. A completed A/B/C session persists actual sets, reps, load/unit, optional RIR, duration and notes. Carries, sled rounds and left/right work are represented accurately.
5. Refresh, app reopening and a simulated connection interruption do not silently discard a saved draft or create duplicate completed sessions. Failures are visible and recoverable.
6. Template edits and phase transitions do not change past workout targets or actual results. Missing/skipped sets and unknown RIR do not cause automatic progression.
7. Progression suggestions follow the stated rep-range/RIR rule, use suitable equipment increments and remain user-controlled. No automatic maximal testing or calendar-driven load jumps occur.
8. Weight, waist, comparable strength, carries and cardio trends use real records and explicit units. Empty states are clear; example values are not presented as achievements.
9. Glucose fields remain optional, are unit-safe and do not prevent saving. The app gives no dosing advice, medication-adjustment instruction or automatic assurance that exercise is safe.
10. Per-user access tests demonstrate that another account cannot read or modify private workout/health records. Logs and analytics do not expose health values or notes.
11. Any migration preserves existing data, can be repeated safely and has a documented recovery path. Existing checks plus focused tests pass, or remaining failures are explicitly reported.
12. Week 12 review works with incomplete data and lets the user continue without losing history. This document reflects the final implementation and clearly lists deferred work.

## 14. Continuation prompt

> Read `docs/FITNESS_APP_PLAN.md`. Inspect the existing application and Firebase data model first. Preserve useful architecture, features and historical data. Implement the checklist in working stages, beginning with the smallest complete mobile workout-logging flow. Keep this document updated, clearly distinguish proposed training defaults from the source plan, and report validation and remaining work.

## 15. Repository audit and implementation decisions (2026-09-28)

- Existing stack: React 19, Vite 7, Tailwind 3, Firebase Auth (Google popup), Firestore. Hosting uses separate permanent sites in project `allwork-e32b6`: `dev` targets `allwork-dev-e32b6`, and `main` targets `allwork-e32b6`. Both use the live channel with no preview expiration. No separate development database is configured.
- Legacy collections: `workouts` (uid, date, name, exercise-level sets/reps/completed and optional bloodSugar before/after), `workoutTemplates` (uid, name, exercises, createdAt), `bloodSugarReadings` (uid, meter/cgm comparison, recordedAt). Legacy glucose displays use mg/dL; new readings explicitly store their unit. No legacy load or RIR history can be inferred.
- Existing Google auth, custom workouts, template creation, workout deletion, reports and meter/CGM comparison remain available under Previous workouts. No migration or rewrite of legacy records is needed.
- Additive model: `users/{uid}/fitnessRecords/{recordId}` with schemaVersion 1, kind, revision, operationId and data. Kinds: profile (preferences + enrollment), template (user-edited version by phase/workout), session (immutable target snapshot + editable actual results), measurement (weight/waist), activity (recovery/cardio). Deterministic profile/template IDs and UUID session/measurement/activity IDs make retries idempotent.
- The session snapshot includes program block/week/phase, accepted template version, planned local date, actual local date, timezone, ISO start/end timestamps, pause time in seconds, exercise identities and load conventions, optional readings and cardio. Suggestions never mutate historical records.
- Browser drafts/outbox are scoped by authenticated UID. Cloud writes use revision-checked transactions; conflicts require explicit local/cloud choice. Only metadata/error categories enter the UI; health payloads do not enter logs or analytics. Device drafts contain private data; settings allow export and local-cache removal after cloud sync.
- New collection queries are scoped to one user's subcollection, sorted client-side, and need no composite indexes. Proposed rules include legacy uid ownership plus path ownership for new records. Live rules have not been fetched or changed; compare against deployed rules before release. Hosting CI does not deploy rules.
- Rollback: restore the prior frontend; leave additive records intact for recovery. No legacy migration, destructive operation or production export is needed for this additive implementation. Export/backup is required before any future migration.
- Baseline: production build passed; lint had one pre-existing unused parameter in the logger. No tests, rules, indexes or emulators were checked in.
- Phase 2 options and Phase 3 B/C are proposals. They require explicit template review; time passing does not advance enrollment or increase volume. Phase 3 B/C start from last accepted Phase 2 edits. Scheduling is advisory and maintains place when moved/skipped.


## 16. Implemented behavior and validation

Implemented on `dev`. Validation used local demo emulators; production user records were not read or modified. Pushing `dev` triggers Hosting deployment to the permanent `allwork-dev-e32b6` site. Database rules are a separate release step and have not been deployed.

- Today is the default authenticated screen. Previous workouts, reports, custom template creation and the original meter/CGM tools remain reachable. Google authentication is preserved.
- Foundation A/B/C are bundled templates; no database seeding or synthetic history. Per-phase user templates have deterministic IDs and explicit accept/save. Build extras are optional edits; Phase 3 B/C copy the last accepted Build targets. Week changes and repeats are manual.
- Sessions snapshot the accepted targets, version, program block, phase/week, dates/timezone and exercise order. Actual sets support load/unit, reps, time/distance, RIR, sides, form, warm-up status, undo, add/remove, substitutions, notes and skip reasons. Finished-session timestamps and active duration are editable. Cardio and glucose are optional.
- Every edit immediately updates an account-scoped device outbox; cloud transactions compare revisions. An operation ID makes acknowledgement-loss retries idempotent. Conflicts offer local/cloud choice plus an export. Web Locks prevent competing same-browser tabs; after a tab releases its lock, the next tab rereads device drafts. Browsers without Web Locks should use one tab.
- Draft storage errors are visible and an export is available; unreadable cache contents are preserved. Cache clearing is blocked while unsynced records/conflicts remain. New records can be exported from Settings; existing workout deletion remains in the original tools.
- Production builds include a service worker caching only the public HTML/JS/CSS shell. Offline reopening is available after a successful initial load and cache installation. Authentication still needs a previously signed-in session; a first-ever Google sign-in needs connectivity. Private records are kept in the account-specific outbox, never the service-worker cache.
- Measurements have editable original units/dates; displays convert without rewriting stored observations. Weekly cardio includes recovery activity and session cardio, with lifting counted separately. Exercise histories retain equipment/load-convention labels. Week 12 compares first/latest real measurements and comparable sets within the current block; missing inputs are shown explicitly.
- Glucose pairs are linked to the session, explicitly unit-converted and counted. Extra readings never enter pair averages. No numeric exercise-clearance rules, medication adjustments or dosing tools were added.
- Firebase Analytics initialization was removed, and the debug logger now omits arbitrary payloads, error text/stacks and URL fragments. No health data sharing was added.

Validation (2026-09-28):

- `pnpm lint`: passes; pre-existing unused logger parameter corrected.
- `pnpm test`: 14 focused model/outbox tests pass.
- `pnpm test:rules`: 2 emulator suites pass, covering owner/other/unauthenticated access, immutable ownership, legacy queries, revision checks and record kind changes.
- `pnpm test:browser`: 4 Chromium suites at 390 × 844 pass, covering A/B/C, a fully completed A, undo, unknown RIR, bilateral carries, optional mixed-unit glucose, phase review, measurement/activity saves, cloud interruption + reload, one-session identity, legacy navigation, same-browser tab locking, cache clearing/sign-out and the production offline shell.
- `pnpm build`: passes. Existing large-bundle and stale browser-support database warnings remain nonblocking.
- Tests use the `demo-workout` Auth/Firestore emulators. The original Google popup/provider is unchanged; live Google sign-in and live rules have not been exercised.

### Remaining release steps and deliberate limits

1. Compare `firestore.rules` with the currently deployed rules before deploying any rules. The supplied rules are tested proposals; the live policy is unknown. Merge any unrelated deployed collection policies instead of blindly replacing them. `firebase.json` and the workflow deploy only Hosting, explicitly selecting the branch’s site target; they do not deploy database rules. New cloud writes may be denied until the reviewed new path rule is installed; the app shows that failure and retains drafts.
2. Obtain clinical review of the safety copy before release. Source links were checked on 2026-09-28; that is source verification, not clinical approval. Phase 2 extras and Phase 3 B/C remain proposals for user review.
3. Personal values from the supplied brief are not seeded into public code or repository docs. Enter private profile/context/goals in Settings. The original supplied file outside the repository retains those values.
4. Photos, nutrition planning, medication management, automatic clinical thresholds, background cross-device merging and automatic phase advancement are intentionally omitted. A conflicting record requires an explicit choice; this avoids guessing which health/workout entry to keep.
5. The first implementation loads program records per account and sorts locally. Pagination/archival is a future scaling task for large histories. Equipment identity must be supplied by the user where machines differ; unspecified equipment is labeled accordingly.
6. The current repository has no account-wide legacy export/deletion flow. Existing per-workout and meter/CGM deletion tools remain; Settings exports the new program records and can clear the synced device cache. No new account deletion or production migration is performed.

### Local validation / continuation

Use Node 20+ (validated with Node 24), pnpm 9+, Firebase CLI and Java 21+. Install dependencies with `pnpm install --frozen-lockfile`, then run:

```sh
pnpm lint
pnpm test
pnpm emulators
# In another terminal, while emulators are running:
pnpm test:rules
pnpm test:browser
```

The browser runner starts its own Vite server on port 5198 and production preview on 5199. The Auth emulator is on 9099 and Firestore on 8080. `pnpm dev:emulator` is available for manual local checks; Google popup sign-in connects to the emulated provider. Emulator selection is development-only and uses the `demo-workout` project.

For rollback, restore the previous frontend build and unregister the new shell service worker in affected browsers if needed. Leave `users/{uid}/fitnessRecords` intact. No legacy data migration or reversal is required. Export and back up before any future destructive change.

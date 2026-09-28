export const PROGRAM_ID = "strength-12-v1";
export const phaseFor = (week) => (week <= 4 ? 1 : week <= 8 ? 2 : 3);
export const phaseNames = ["Foundation", "Build", "Strength / performance"];
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const optionalNumber = (value) =>
  value === "" || value == null
    ? null
    : Number.isFinite(Number(value))
      ? Number(value)
      : null;
export const round = (value, digits = 1) => Number(value.toFixed(digits));
export function convert(value, from, to) {
  if (value == null || value === "") return null;
  if (from === to) return Number(value);
  const scales = {
    lb: ["mass", 0.45359237],
    kg: ["mass", 1],
    in: ["length", 2.54],
    cm: ["length", 1],
    m: ["distance", 1],
    km: ["distance", 1000],
    mi: ["distance", 1609.344],
    "mg/dL": ["glucose", 1],
    "mmol/L": ["glucose", 18.0182],
  };
  if (!scales[from] || scales[from][0] !== scales[to]?.[0])
    throw new Error("Incompatible units");
  return (Number(value) * scales[from][1]) / scales[to][1];
}
const catalog = [
  ["leg-press", "Leg press", "reps", "machine", "squat"],
  ["db-bench", "Dumbbell bench press", "reps", "per-dumbbell", "press"],
  ["seated-row", "Seated cable row", "reps", "machine", "pull"],
  ["rdl", "Romanian deadlift", "reps", "total", "hinge"],
  ["pulldown", "Lat pulldown", "reps", "machine", "pull"],
  [
    "lateral-raise",
    "Dumbbell lateral raise",
    "reps",
    "per-dumbbell",
    "accessory",
  ],
  ["farmer", "Farmer carry", "seconds", "per-dumbbell", "carry"],
  ["goblet", "Goblet squat", "reps", "total", "squat"],
  ["chest-press", "Machine chest press", "reps", "machine", "press"],
  ["cable-row", "Cable row", "reps", "machine", "pull"],
  ["step-up", "Step-ups", "reps", "per-dumbbell", "single-leg"],
  [
    "shoulder-press",
    "Dumbbell shoulder press",
    "reps",
    "per-dumbbell",
    "press",
  ],
  ["chop", "Cable chop", "reps", "machine", "rotation"],
  ["sled", "Sled push", "distance", "added-plates", "sled"],
  ["suitcase", "Suitcase carry", "seconds", "total", "carry"],
  ["hack-squat", "Hack squat", "reps", "machine", "squat"],
  ["incline-press", "Incline dumbbell press", "reps", "per-dumbbell", "press"],
  ["db-rdl", "Dumbbell Romanian deadlift", "reps", "per-dumbbell", "hinge"],
  ["curl", "Dumbbell curl", "reps", "per-dumbbell", "accessory"],
  ["triceps", "Triceps pressdown", "reps", "machine", "accessory"],
  ["sled-pull", "Sled pull", "distance", "added-plates", "sled"],
  ["split-squat", "Split squat", "reps", "per-dumbbell", "single-leg"],
  ["pallof", "Pallof press", "reps", "machine", "anti-rotation"],
];
export const EXERCISES = Object.fromEntries(
  catalog.map(([id, name, metric, convention, category]) => [
    id,
    { id, name, metric, convention, category },
  ]),
);
const prescription = (id, sets, min, max = min, sides = false) => ({
  ...EXERCISES[id],
  sets,
  min,
  max,
  sides,
  optional: false,
  rest:
    id === "sled"
      ? 90
      : ["accessory", "carry"].includes(EXERCISES[id].category)
        ? 90
        : 120,
});
export function baseTemplate(letter, phase = 1, carried = null) {
  const exercises = {
    A: [
      prescription("leg-press", 3, 10),
      prescription("db-bench", 3, 8, 12),
      prescription("seated-row", 3, 10, 12),
      prescription("rdl", 3, 8, 10),
      prescription("pulldown", 3, 10, 12),
      prescription("lateral-raise", 2, 12, 15),
      prescription("farmer", 3, 30),
    ],
    B: [
      prescription("goblet", 3, 10),
      prescription("chest-press", 3, 10),
      prescription("cable-row", 3, 10),
      prescription("step-up", 3, 8, 8, true),
      prescription("shoulder-press", 2, 10),
      prescription("chop", 3, 10, 10, true),
      prescription("sled", 4, 20, 30),
      prescription("suitcase", 3, 30, 30, true),
    ],
    C: [
      prescription("leg-press", 3, 10, 12),
      prescription("incline-press", 3, 8, 12),
      prescription("pulldown", 3, 8, 12),
      prescription("db-rdl", 3, 10),
      prescription("cable-row", 2, 10, 12),
      prescription("curl", 2, 10, 15),
      prescription("triceps", 2, 10, 15),
      prescription("farmer", 3, 30, 45),
    ],
  };
  let template = {
    letter,
    phase,
    version: 1,
    name: {
      A: "Strength foundation",
      B: "Functional strength",
      C: "Muscle and strength",
    }[letter],
    rir: phase === 1 ? 2 : 1,
    exercises: exercises[letter],
    cardio: {
      modality: letter === "B" ? "Cycling / elliptical" : "Incline walking",
      min: letter === "C" ? 15 : 10,
      max: letter === "C" ? 20 : 15,
    },
    provenance: "Source plan",
  };
  if (phase === 2)
    template = {
      ...template,
      provenance: "Proposed defaults — review and edit",
      cardio: { ...template.cardio, min: 15, max: 25 },
    };
  if (phase === 3 && letter === "A")
    template = {
      ...template,
      name: "Strength / performance",
      exercises: [
        prescription("leg-press", 4, 6, 8),
        prescription("db-bench", 4, 6, 8),
        prescription("cable-row", 3, 8, 10),
        prescription("rdl", 3, 8),
        prescription("pulldown", 3, 8, 10),
        prescription("farmer", 4, 45),
        { ...prescription("lateral-raise", 2, 12, 15), optional: true },
      ],
      cardio: { modality: "Incline walking", min: 15, max: 15 },
      provenance:
        "Source Workout A example; optional lateral raises; proposed 1–2 RIR",
    };
  if (phase === 3 && letter !== "A")
    template = {
      ...(carried || baseTemplate(letter, 2)),
      phase: 3,
      version: 1,
      rir: 1,
      provenance:
        "Carried forward from accepted Build template — review and edit",
    };
  return structuredClone(template);
}
export function defaultProfile() {
  return {
    week: 1,
    blockId: crypto.randomUUID(),
    next: "A",
    startDate: localDate(),
    schedule: [1, 3, 5],
    time: "11:30",
    nextDate: localDate(),
    unit: "lb",
    waistUnit: "in",
    glucoseUnit: "mg/dL",
    weeklyCardio: 150,
    goalWeight: null,
    age: null,
    heightCm: null,
    startingWeight: null,
    healthNotes: "",
    safetyPlan: "",
    goals: "Strength, mobility and consistency",
    paused: false,
    repeats: 0,
  };
}
export function targetLabel(ex) {
  return `${ex.sets} × ${ex.min}${ex.max !== ex.min ? `–${ex.max}` : ""} ${ex.metric === "reps" ? "reps" : ex.metric === "seconds" ? "sec" : "m"}${ex.sides ? " each side" : ""}`;
}
export function comparable(ex, other) {
  return (
    ex.id === other.id &&
    ex.convention === other.convention &&
    (ex.equipment || "") === (other.equipment || "")
  );
}
export function previousExercise(sessions, ex, excludeId) {
  return [...sessions]
    .filter(
      (s) => s.id !== excludeId && ["completed", "partial"].includes(s.status),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .flatMap((s) =>
      s.exercises
        .filter((e) => comparable(ex, e))
        .map((e) => ({ ...e, date: s.date, sessionStatus: s.status })),
    )
    .find((e) => !e.skipped && e.actual.some((s) => s.done && !s.warmup));
}
export function progression(previous, target, unit, increment) {
  const sets = previous?.actual.filter((s) => !s.warmup) || [];
  const needed = previous?.sets * (previous?.sides ? 2 : 1);
  const eligible =
    previous?.sessionStatus === "completed" &&
    previous.metric === "reps" &&
    comparable(previous, target) &&
    !previous.skipped &&
    sets.length >= needed &&
    sets.every(
      (s) =>
        s.done &&
        s.reps >= previous.max &&
        s.rir != null &&
        s.rir >= (previous.rirTarget ?? 2) &&
        s.form !== false &&
        s.load != null &&
        s.unit !== "setting",
    ) &&
    new Set(sets.map((s) => convert(s.load, s.unit, unit))).size === 1;
  return eligible && increment > 0
    ? round(convert(sets[0].load, sets[0].unit, unit) + increment, 2)
    : null;
}
export function makeSet(ex, unit, side = "", previous = null) {
  return {
    id: crypto.randomUUID(),
    side,
    warmup: false,
    done: false,
    reps: ex.metric === "reps" ? ex.min : null,
    seconds: ex.metric === "seconds" ? ex.min : null,
    distance: ex.metric === "distance" ? ex.min : null,
    distanceUnit: "m",
    load:
      previous?.load == null
        ? null
        : previous.unit === "setting"
          ? previous.load
          : round(convert(previous.load, previous.unit, unit), 2),
    unit: previous?.unit === "setting" ? "setting" : unit,
    rir: null,
    form: true,
  };
}
export function createSession(
  template,
  profile,
  history = [],
  skipped = false,
) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    programId: PROGRAM_ID,
    blockId: profile.blockId,
    week: profile.week,
    phase: phaseFor(profile.week),
    letter: template.letter,
    name: `Workout ${template.letter} · ${template.name}`,
    template: structuredClone(template),
    date: localDate(),
    plannedDate: profile.nextDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startedAt: now,
    endedAt: skipped ? now : null,
    status: skipped ? "skipped" : "in-progress",
    pausedAt: null,
    pausedSeconds: 0,
    durationSeconds: skipped ? 0 : null,
    notes: "",
    glucose: [],
    cardio: {
      modality: template.cardio.modality,
      minutes: null,
      distance: null,
      distanceUnit: "km",
      effort: "",
      incline: "",
    },
    exercises: template.exercises.map((ex) => {
      const prev = previousExercise(history, ex);
      return {
        ...ex,
        rirTarget: template.rir,
        skipped: false,
        skipReason: "",
        notes: "",
        equipment: ex.equipment || "",
        actual: Array.from({ length: ex.sets }, (_, index) =>
          ex.sides
            ? ["left", "right"].map((side) =>
                makeSet(
                  ex,
                  profile.unit,
                  side,
                  prev?.actual.filter(
                    (s) => !s.warmup && s.done && s.side === side,
                  )[index],
                ),
              )
            : [
                makeSet(
                  ex,
                  profile.unit,
                  "",
                  prev?.actual.filter((s) => !s.warmup && s.done)[index],
                ),
              ],
        ).flat(),
      };
    }),
  };
}
export function elapsedSeconds(session, now = Date.now()) {
  return Math.max(
    0,
    Math.round(
      ((session.pausedAt
        ? Date.parse(session.pausedAt)
        : session.endedAt
          ? Date.parse(session.endedAt)
          : now) -
        Date.parse(session.startedAt)) /
        1000 -
        session.pausedSeconds,
    ),
  );
}
export function setError(ex, set) {
  if (set.load != null && (!Number.isFinite(set.load) || set.load < 0))
    return "Load must be zero or more.";
  if (set.rir != null && (set.rir < 0 || set.rir > 10))
    return "RIR must be 0–10, or blank for unknown.";
  const value =
    set[
      ex.metric === "reps"
        ? "reps"
        : ex.metric === "seconds"
          ? "seconds"
          : "distance"
    ];
  if (!(value > 0) || (ex.metric === "reps" && !Number.isInteger(value)))
    return `Enter ${ex.metric === "reps" ? "whole positive reps" : "a positive duration or distance"} before completing.`;
  return null;
}
export function finishSession(session) {
  const required = session.exercises.filter((e) => !e.optional);
  const complete =
    required.length > 0 &&
    required.every(
      (ex) =>
        !ex.skipped &&
        ex.actual.filter((s) => !s.warmup && s.done && !setError(ex, s))
          .length >=
          ex.sets * (ex.sides ? 2 : 1) &&
        ex.actual
          .filter((s) => !s.warmup)
          .every((s) => s.done && !setError(ex, s)) &&
        (!ex.sides ||
          ["left", "right"].every(
            (side) =>
              ex.actual.filter((s) => !s.warmup && s.done && s.side === side)
                .length >= ex.sets,
          )),
    );
  return {
    ...session,
    status: complete ? "completed" : "partial",
    durationSeconds:
      session.status === "in-progress"
        ? elapsedSeconds(session)
        : session.durationSeconds,
    endedAt: session.endedAt || new Date().toISOString(),
  };
}
export function nextScheduled(date, days) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + 2);
  for (let i = 0; i < 7; i++, d.setDate(d.getDate() + 1))
    if (days.includes(d.getDay())) return localDate(d);
  return localDate(d);
}
export function scheduleValid(days) {
  return (
    days.length === 3 && days.every((day) => !days.includes((day + 1) % 7))
  );
}
export function advanceProfile(profile, session) {
  return {
    ...profile,
    next: session.letter === "A" ? "B" : session.letter === "B" ? "C" : "A",
    nextDate: nextScheduled(session.date, profile.schedule),
  };
}
export function glucosePairs(sessions, unit) {
  return sessions.flatMap((session) => {
    const before = session.glucose.find((g) => g.timing === "before");
    const after = session.glucose.find((g) => g.timing === "after");
    return before && after
      ? [
          {
            date: session.date,
            delta:
              convert(after.value, after.unit, unit) -
              convert(before.value, before.unit, unit),
          },
        ]
      : [];
  });
}
export function weekStart(date = localDate()) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localDate(d);
}

export function canSchedule(date, sessions) {
  const day = Date.parse(`${date}T12:00:00Z`);
  return (
    Number.isFinite(day) &&
    sessions
      .filter((s) => ["completed", "partial"].includes(s.status))
      .every(
        (s) =>
          Math.abs(day - Date.parse(`${s.date}T12:00:00Z`)) >= 2 * 86400000,
      )
  );
}
export function localDateTime(iso) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

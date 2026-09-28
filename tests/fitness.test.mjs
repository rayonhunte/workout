import test from "node:test";
import assert from "node:assert/strict";
import {
  baseTemplate,
  defaultProfile,
  createSession,
  finishSession,
  progression,
  convert,
  glucosePairs,
  scheduleValid,
  nextScheduled,
  elapsedSeconds,
} from "../src/fitness/model.js";
import { FitnessStore } from "../src/fitness/store.js";
const tick = () => new Promise((resolve) => setTimeout(resolve, 15));
const storage = () => {
  const values = new Map();
  return { getItem: (k) => values.get(k), setItem: (k, v) => values.set(k, v) };
};

test("Foundation matches A/B/C, unilateral rounds and optional Phase 3 accessory", () => {
  assert.deepEqual(
    baseTemplate("A").exercises.map((e) => e.sets),
    [3, 3, 3, 3, 3, 2, 3],
  );
  const session = createSession(baseTemplate("B"), defaultProfile());
  assert.equal(
    session.exercises.find((e) => e.id === "suitcase").actual.length,
    6,
  );
  assert.deepEqual(
    session.exercises
      .find((e) => e.id === "suitcase")
      .actual.map((s) => s.side),
    ["left", "right", "left", "right", "left", "right"],
  );
  assert.equal(
    baseTemplate("C").exercises.filter(
      (e) => e.id === "leg-press" || e.id === "hack-squat",
    ).length,
    1,
  );
  assert.equal(baseTemplate("A", 3).exercises.at(-1).optional, true);
  assert.equal(baseTemplate("B", 2).exercises[0].sets, 3);
});
test("Phase 3 B/C carry accepted edits without aliasing historical targets", () => {
  const edited = baseTemplate("B", 2);
  edited.exercises[0].sets = 4;
  const next = baseTemplate("B", 3, edited);
  assert.equal(next.exercises[0].sets, 4);
  next.exercises[0].sets = 2;
  assert.equal(edited.exercises[0].sets, 4);
  const s = createSession(edited, defaultProfile());
  edited.exercises[0].sets = 9;
  assert.equal(s.template.exercises[0].sets, 4);
});
test("Missing RIR, warm-up, skipped, partial and failed sets do not progress", () => {
  const target = baseTemplate("A").exercises[1];
  const previous = {
    ...target,
    rirTarget: 2,
    sessionStatus: "completed",
    actual: Array.from({ length: 3 }, () => ({
      done: true,
      reps: 12,
      rir: 2,
      load: 50,
      unit: "lb",
      form: true,
      warmup: false,
    })),
  };
  assert.equal(progression(previous, target, "lb", 5), 55);
  for (const patch of [
    { rir: null },
    { done: false },
    { reps: 11 },
    { form: false },
    { load: null },
  ]) {
    const bad = structuredClone(previous);
    Object.assign(bad.actual[0], patch);
    assert.equal(progression(bad, target, "lb", 5), null);
  }
  assert.equal(
    progression({ ...previous, sessionStatus: "partial" }, target, "lb", 5),
    null,
  );
  assert.equal(
    progression({ ...previous, skipped: true }, target, "lb", 5),
    null,
  );
  assert.equal(
    progression(
      previous,
      { ...target, equipment: "different machine" },
      "lb",
      5,
    ),
    null,
  );
  assert.equal(progression(previous, target, "lb", null), null);
});
test("Completion requires both sides and all working sets; warm-ups do not count", () => {
  let s = createSession(baseTemplate("B"), defaultProfile());
  assert.equal(finishSession(s).status, "partial");
  s.exercises.forEach((e) => e.actual.forEach((a) => (a.done = true)));
  assert.equal(finishSession(s).status, "completed");
  s.exercises.find((e) => e.id === "suitcase").actual.pop();
  assert.equal(finishSession(s).status, "partial");
  s = createSession(baseTemplate("A"), defaultProfile());
  s.exercises.forEach((e) =>
    e.actual.forEach((a) => {
      a.done = true;
      a.warmup = true;
    }),
  );
  assert.equal(finishSession(s).status, "partial");
});
test("Unit conversions preserve nulls and pairing never crosses sessions", () => {
  assert.equal(convert(null, "lb", "kg"), null);
  assert.equal(convert(100, "lb", "kg"), 45.359237);
  assert.equal(convert(1, "in", "cm"), 2.54);
  assert.ok(Math.abs(convert(5, "mmol/L", "mg/dL") - 90.091) < 1e-10);
  assert.throws(() => convert(1, "kg", "cm"));
  const rows = [
    {
      date: "2026-09-28",
      glucose: [
        { timing: "before", value: 5, unit: "mmol/L" },
        { timing: "after", value: 108.1092, unit: "mg/dL" },
      ],
    },
    { glucose: [{ timing: "before", value: 100, unit: "mg/dL" }] },
    { glucose: [{ timing: "after", value: 150, unit: "mg/dL" }] },
  ];
  const pairs = glucosePairs(rows, "mmol/L");
  assert.equal(pairs.length, 1);
  assert.ok(Math.abs(pairs[0].delta - 1) < 1e-10);
});
test("Scheduling leaves recovery days and elapsed time excludes pauses", () => {
  assert.equal(scheduleValid([1, 3, 5]), true);
  assert.equal(scheduleValid([0, 1, 3]), false);
  assert.equal(scheduleValid([6, 0, 3]), false);
  assert.equal(nextScheduled("2026-09-28", [1, 3, 5]), "2026-09-30");
  assert.equal(
    elapsedSeconds({
      startedAt: "2026-09-28T12:00:00Z",
      pausedAt: "2026-09-28T12:20:00Z",
      pausedSeconds: 120,
    }),
    1080,
  );
});
test("Offline outbox resumes on reload with the same identity and no duplicates", async () => {
  const disk = storage(),
    remote = {};
  const transport = {
    write: async (id, record) => {
      remote[id] = { ...record, revision: record.revision + 1 };
      return record.revision + 1;
    },
  };
  const a = new FitnessStore("a", disk, transport);
  a.online = false;
  a.put("same-session", "session", { notes: "draft" });
  const b = new FitnessStore("a", disk, transport);
  assert.equal(b.records["same-session"].data.notes, "draft");
  await b.flush();
  assert.equal(Object.keys(remote).length, 1);
  assert.equal(b.snapshot.pending, 0);
  const other = new FitnessStore("b", disk, transport);
  assert.equal(Object.keys(other.records).length, 0);
});
test("Coalesced edits made during a cloud write are persisted after acknowledgement", async () => {
  const disk = storage();
  let release;
  const sent = [];
  const store = new FitnessStore("a", disk, {
    write: async (id, r) => {
      sent.push(r.data.notes);
      if (sent.length === 1)
        await new Promise((resolve) => (release = resolve));
      return r.revision + 1;
    },
  });
  store.put("s", "session", { notes: "one" });
  store.put("s", "session", { notes: "two" });
  release();
  await tick();
  assert.deepEqual(sent, ["one", "two"]);
  assert.equal(store.records.s.revision, 2);
  assert.equal(store.snapshot.pending, 0);
});
test("Rejected writes retain recoverable draft; stale revisions require explicit choice", async () => {
  let reject = true;
  const store = new FitnessStore("a", storage(), {
    write: async () => {
      if (reject) throw new Error("offline");
      return 1;
    },
  });
  store.put("s", "session", { notes: "keep" });
  await tick();
  assert.equal(store.snapshot.pending, 1);
  assert.match(store.error, /retained/);
  reject = false;
  store.retry();
  await tick();
  assert.equal(store.snapshot.pending, 0);
  store.transport.write = async () => {
    throw Object.assign(new Error(), {
      conflict: true,
      remote: { data: { notes: "cloud" }, kind: "session", revision: 3 },
    });
  };
  store.put("s", "session", { notes: "device" });
  await tick();
  assert.equal(store.conflicts.s.revision, 3);
  assert.equal(store.records.s.data.notes, "device");
  store.resolve("s", false);
  assert.equal(store.records.s.data.notes, "cloud");
  assert.equal(store.snapshot.pending, 0);
});
test("Storage failures never claim durable local save", () => {
  const store = new FitnessStore(
    "a",
    {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    },
    {},
  );
  store.online = false;
  store.put("s", "session", {});
  assert.match(store.error, /memory only/);
  assert.equal(store.storageError, true);
});

test("Opening after another tab reloads its unsynced records before watching", () => {
  const disk = storage();
  const first = new FitnessStore("a", disk, {});
  first.online = false;
  const second = new FitnessStore("a", disk, { watch: () => () => {} });
  second.online = false;
  first.put("late-record", "session", {
    notes: "written after second tab opened",
  });
  second.start();
  assert.equal(
    second.records["late-record"].data.notes,
    "written after second tab opened",
  );
});
test("Malformed device cache is retained for export rather than overwritten", () => {
  const disk = storage();
  disk.setItem("fitness-v1:a", "not valid json");
  const store = new FitnessStore("a", disk, {});
  store.online = false;
  store.put("s", "session", {});
  assert.equal(disk.getItem("fitness-v1:a"), "not valid json");
  assert.equal(store.corruptCache, "not valid json");
});
test("Cloud listener can be retried after permission recovery", () => {
  let calls = 0;
  const store = new FitnessStore("a", storage(), {
    watch: (_next, error) => {
      calls++;
      if (calls === 1) error();
      return () => {};
    },
  });
  store.online = false;
  store.start();
  assert.equal(store.watchFailed, true);
  store.retry();
  assert.equal(calls, 2);
  assert.equal(store.watchFailed, false);
});
test("Corrected duration survives saving a finished session again", () => {
  const s = finishSession(createSession(baseTemplate("A"), defaultProfile()));
  s.durationSeconds = 3600;
  assert.equal(finishSession(s).durationSeconds, 3600);
});

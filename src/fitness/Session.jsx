import { useEffect, useState } from "react";
import {
  EXERCISES,
  localDateTime,
  elapsedSeconds,
  finishSession,
  targetLabel,
  makeSet,
  previousExercise,
  progression,
  setError as validateSet,
  convert,
  round,
} from "./model";
import { Panel, Field, NumberField, Select } from "./ui";
import Safety from "./Safety";

export default function Session({
  session,
  sessions,
  profile,
  save,
  onBack,
  onFinish,
}) {
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [restUntil, setRestUntil] = useState(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const change = (patch) => save({ ...session, ...patch });
  const exerciseChange = (index, ex) =>
    change({
      exercises: session.exercises.map((e, i) => (i === index ? ex : e)),
    });
  const seconds =
    session.status === "in-progress"
      ? elapsedSeconds(session, now)
      : session.durationSeconds;
  const pause = () =>
    session.pausedAt
      ? change({
          pausedSeconds:
            session.pausedSeconds +
            Math.round((Date.now() - Date.parse(session.pausedAt)) / 1000),
          pausedAt: null,
        })
      : change({ pausedAt: new Date().toISOString() });
  const finish = () => {
    const invalid = session.exercises
      .flatMap((ex) =>
        ex.actual.filter((s) => s.done).map((s) => validateSet(ex, s)),
      )
      .find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    onFinish(finishSession(session));
  };
  return (
    <>
      <button className="fit-back" onClick={onBack}>
        ← Today
      </button>
      <div className="fit-session-header">
        <span className="fit-eyebrow">
          WEEK {session.week} · WORKOUT {session.letter}
        </span>
        <h2>{session.name}</h2>
        <p>
          {session.status} · {Math.floor((seconds || 0) / 60)} min{" "}
          {(seconds || 0) % 60} sec{" "}
          {session.pausedAt && session.status === "in-progress"
            ? "· paused"
            : ""}
        </p>
        <p className="fit-muted">
          Active time excludes pauses; closing the app keeps the timer running
          until paused.
        </p>
        <div className="fit-actions">
          {session.status === "in-progress" && (
            <button onClick={pause}>
              {session.pausedAt ? "Resume timer" : "Pause workout"}
            </button>
          )}
          <a
            href="#session-safety"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("session-safety")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Log symptoms / reading
          </a>
        </div>
      </div>
      {restUntil && (
        <div className="fit-rest" role="status">
          {restUntil > now
            ? `Rest · ${Math.ceil((restUntil - now) / 1000)} sec`
            : "Rest timer finished. Take longer if you need."}
          <button onClick={() => setRestUntil(null)}>Dismiss</button>
        </div>
      )}
      <Panel title="Warm up & settle in">
        <p>
          8–10 minutes of easy movement and mobility. Add ramp-up sets below;
          they do not count toward working sets. Aim for {session.template.rir}–
          {session.template.rir + 1} good-form reps in reserve.
        </p>
      </Panel>
      {session.exercises.map((ex, i) => (
        <Exercise
          key={`${i}-${ex.id}`}
          ex={ex}
          index={i}
          onChange={(e) => exerciseChange(i, e)}
          history={sessions}
          sessionId={session.id}
          unit={profile.unit}
          onRest={() => setRestUntil(Date.now() + ex.rest * 1000)}
        />
      ))}
      <Panel title="Cardio · conversational pace">
        <p className="fit-muted">
          Target {session.template.cardio.min}–{session.template.cardio.max}{" "}
          min. Record actual time; shortening or skipping is okay.
        </p>
        <Field
          label="Modality"
          value={session.cardio.modality}
          onChange={(e) =>
            change({ cardio: { ...session.cardio, modality: e.target.value } })
          }
        />
        <div className="fit-grid">
          <NumberField
            label="Actual minutes"
            value={session.cardio.minutes}
            onChange={(minutes) =>
              change({ cardio: { ...session.cardio, minutes } })
            }
          />
          <NumberField
            label={`Distance (${session.cardio.distanceUnit}, optional)`}
            value={session.cardio.distance}
            onChange={(distance) =>
              change({ cardio: { ...session.cardio, distance } })
            }
          />
          <Select
            label="Distance unit"
            value={session.cardio.distanceUnit}
            options={["km", "mi", "m"]}
            onChange={(distanceUnit) =>
              change({
                cardio: {
                  ...session.cardio,
                  distanceUnit,
                  distance:
                    session.cardio.distance == null
                      ? null
                      : round(
                          convert(
                            session.cardio.distance,
                            session.cardio.distanceUnit,
                            distanceUnit,
                          ),
                          2,
                        ),
                },
              })
            }
          />
          <Field
            label="Effort (optional)"
            value={session.cardio.effort}
            onChange={(e) =>
              change({ cardio: { ...session.cardio, effort: e.target.value } })
            }
          />
          <Field
            label="Incline / resistance (optional)"
            value={session.cardio.incline}
            onChange={(e) =>
              change({ cardio: { ...session.cardio, incline: e.target.value } })
            }
          />
        </div>
      </Panel>
      <div id="session-safety">
        <Panel title="Optional glucose & symptoms">
          <GlucoseForm
            unit={profile.glucoseUnit}
            readings={session.glucose}
            onChange={(glucose) => change({ glucose })}
          />
          <Field label="Session notes / symptoms / shortened session reason">
            <textarea
              value={session.notes}
              onChange={(e) => change({ notes: e.target.value })}
            />
          </Field>
        </Panel>
        <Safety profile={profile} />
      </div>
      <Panel title="Session details">
        <Field
          label="Local workout date"
          type="date"
          value={session.date}
          onChange={(e) => {
            if (e.target.value) change({ date: e.target.value });
          }}
        />
        <p className="fit-muted">
          Recorded timezone: {session.timezone}. Started{" "}
          {new Date(session.startedAt).toLocaleString()}.
        </p>
        {session.status !== "in-progress" && (
          <NumberField
            label="Correct active duration (minutes)"
            value={round((session.durationSeconds || 0) / 60, 1)}
            onChange={(v) =>
              change({
                durationSeconds: Math.max(0, Math.round((v || 0) * 60)),
              })
            }
          />
        )}
        <details>
          <summary>Correct start / end timestamps</summary>
          <Field
            label="Start time (local)"
            type="datetime-local"
            value={localDateTime(session.startedAt)}
            onChange={(e) => {
              if (!e.target.value) return;
              const startedAt = new Date(e.target.value).toISOString();
              if (
                Date.parse(startedAt) >
                Date.parse(session.endedAt || new Date().toISOString())
              ) {
                setError("Start must be before the end of the session.");
                return;
              }
              change({ startedAt });
            }}
          />
          {session.endedAt && (
            <Field
              label="End time (local)"
              type="datetime-local"
              value={localDateTime(session.endedAt)}
              onChange={(e) => {
                if (!e.target.value) return;
                const endedAt = new Date(e.target.value).toISOString();
                if (Date.parse(endedAt) < Date.parse(session.startedAt)) {
                  setError("End must follow the start.");
                  return;
                }
                change({ endedAt });
              }}
            />
          )}
          <p className="fit-muted">
            For finished sessions, correct active duration separately to account
            for pauses.
          </p>
        </details>
        <details>
          <summary>
            Original target snapshot · version {session.template.version}
          </summary>
          <ul>
            {session.template.exercises.map((e, i) => (
              <li key={i}>
                {e.name}: {targetLabel(e)}
              </li>
            ))}
          </ul>
        </details>
      </Panel>
      {error && (
        <p role="alert" className="fit-error">
          {error}
        </p>
      )}
      <div className="fit-finish">
        <button className="fit-primary" onClick={finish}>
          {session.status === "in-progress"
            ? "Finish workout"
            : "Save corrections & recalculate status"}
        </button>
        <p>
          Unfinished required sets save as a partial workout. Your entries are
          already autosaved.
        </p>
      </div>
    </>
  );
}
function Exercise({ ex, index, onChange, history, sessionId, unit, onRest }) {
  const [error, setError] = useState("");
  const [increment, setIncrement] = useState(null);
  const previous = previousExercise(history, ex, sessionId);
  const suggestion = progression(previous, ex, unit, increment);
  const update = (id, patch) =>
    onChange({
      ...ex,
      actual: ex.actual.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  const add = (warmup) =>
    onChange({
      ...ex,
      actual: [
        ...ex.actual,
        ...(ex.sides ? ["left", "right"] : [""]).map((side) => ({
          ...makeSet(ex, unit, side),
          warmup,
        })),
      ],
    });
  const completed = ex.actual.filter((s) => s.done && !s.warmup).length;
  return (
    <Panel className={ex.skipped ? "fit-skipped" : ""}>
      <div className="fit-exercise-title">
        <span className="fit-number">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h2>{ex.name}</h2>
          <p>
            {targetLabel(ex)} · {ex.optional ? "optional" : "working sets"}
          </p>
        </div>
        <span className="fit-badge">
          {completed}/{ex.sets * (ex.sides ? 2 : 1)}
        </span>
      </div>
      <p className="fit-muted">
        Load: {ex.convention.replaceAll("-", " ")}
        {ex.equipment ? ` · ${ex.equipment}` : ""}. Rest {ex.rest} sec or longer
        as needed.
      </p>
      <details>
        <summary>
          Previous performance & history
          {previous ? ` · ${previous.date}` : " · no comparable sets yet"}
        </summary>
        {previous && (
          <p>
            {previous.actual
              .filter((s) => s.done && !s.warmup)
              .map(
                (s) =>
                  `${s.side ? s.side + " " : ""}${s.load ?? "—"} ${s.unit} × ${s[ex.metric === "reps" ? "reps" : ex.metric === "seconds" ? "seconds" : "distance"]} ${ex.metric} · RIR ${s.rir ?? "unknown"}`,
              )
              .join("; ")}
          </p>
        )}
        <p>
          Same exercise, equipment and load convention only. Blank RIR, skipped
          work or partial sessions do not qualify for a load increase.
        </p>
        {ex.metric === "reps" ? (
          <>
            <NumberField
              label={`Your smallest available increase (${unit})`}
              value={increment}
              onChange={setIncrement}
            />
            {suggestion != null ? (
              <p>
                Suggestion: {suggestion} {unit}. Confirm your actual load in
                each set; nothing is marked complete.
              </p>
            ) : (
              <p>
                Repeat or adjust based on technique and recovery. A load
                increase is suggested only when all prior working sets reach the
                top target at the required RIR.
              </p>
            )}
          </>
        ) : (
          <p>
            Progress one variable at a time: load, time, distance or rounds.
          </p>
        )}
        <div className="fit-history-small">
          {[...history]
            .filter(
              (s) =>
                s.id !== sessionId &&
                ["completed", "partial"].includes(s.status),
            )
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
            .flatMap((s) =>
              s.exercises
                .filter(
                  (e) =>
                    e.id === ex.id &&
                    e.convention === ex.convention &&
                    (e.equipment || "") === (ex.equipment || ""),
                )
                .map((e) => (
                  <p key={`${s.id}-${e.id}`}>
                    {s.date} ·{" "}
                    {e.actual
                      .filter((a) => a.done && !a.warmup)
                      .map(
                        (a) =>
                          `${a.side} ${a.load ?? "—"} ${a.unit} × ${a.reps ?? a.seconds ?? a.distance} · RIR ${a.rir ?? "?"}`,
                      )
                      .join("; ")}
                  </p>
                )),
            )}
        </div>
      </details>
      {!ex.skipped &&
        ex.actual.map((set, i) => (
          <div className={`fit-set ${set.done ? "is-done" : ""}`} key={set.id}>
            <div className="fit-set-title">
              <strong>
                {set.warmup
                  ? "Warm-up"
                  : `Set ${ex.sides ? Math.floor(i / 2) + 1 : i + 1}`}{" "}
                {set.side}
              </strong>
              <button
                aria-label={`Remove ${ex.name} set ${i + 1}`}
                onClick={() => {
                  if (set.done && !window.confirm("Remove this logged set?"))
                    return;
                  onChange({
                    ...ex,
                    actual: ex.actual.filter((s) => s.id !== set.id),
                  });
                }}
              >
                Remove
              </button>
            </div>
            <div className="fit-set-grid">
              <NumberField
                label={`Load (${set.unit})`}
                value={set.load}
                onChange={(load) => update(set.id, { load })}
              />
              <NumberField
                label={
                  ex.metric === "reps"
                    ? "Reps"
                    : ex.metric === "seconds"
                      ? "Seconds"
                      : `Distance (${set.distanceUnit})`
                }
                min="0"
                step={ex.metric === "reps" ? "1" : "any"}
                value={
                  set[
                    ex.metric === "reps"
                      ? "reps"
                      : ex.metric === "seconds"
                        ? "seconds"
                        : "distance"
                  ]
                }
                onChange={(value) =>
                  update(set.id, {
                    [ex.metric === "reps"
                      ? "reps"
                      : ex.metric === "seconds"
                        ? "seconds"
                        : "distance"]: value,
                  })
                }
              />
              <NumberField
                label="RIR (optional)"
                max="10"
                value={set.rir}
                onChange={(rir) => update(set.id, { rir })}
              />
            </div>
            <div className="fit-set-bottom">
              <Select
                label="Load unit"
                value={set.unit}
                options={["lb", "kg", "setting"]}
                onChange={(newUnit) =>
                  update(set.id, {
                    unit: newUnit,
                    load:
                      newUnit === "setting" || set.unit === "setting"
                        ? null
                        : set.load == null
                          ? null
                          : round(convert(set.load, set.unit, newUnit), 2),
                  })
                }
              />
              <button
                className={set.done ? "fit-complete" : "fit-primary"}
                aria-label={`${set.done ? "Undo" : "Complete"} ${ex.name} set ${i + 1}`}
                onClick={() => {
                  const message = validateSet(ex, set);
                  if (!set.done && message) {
                    setError(message);
                    return;
                  }
                  setError("");
                  update(set.id, { done: !set.done });
                }}
              >
                {set.done ? "✓ Undo" : "Complete"}
              </button>
            </div>
            <label className="fit-check">
              <input
                type="checkbox"
                checked={set.form}
                onChange={(e) => update(set.id, { form: e.target.checked })}
              />
              Good form maintained
            </label>
          </div>
        ))}
      {error && (
        <p role="alert" className="fit-error">
          {error}
        </p>
      )}
      <div className="fit-actions">
        <button disabled={ex.skipped} onClick={() => add(false)}>
          + Working set{ex.sides ? " pair" : ""}
        </button>
        <button disabled={ex.skipped} onClick={() => add(true)}>
          + Warm-up{ex.sides ? " pair" : ""}
        </button>
        <button onClick={onRest}>Rest timer</button>
      </div>
      <details>
        <summary>Notes, equipment or substitute</summary>
        <Field label="Exercise notes">
          <textarea
            value={ex.notes}
            onChange={(e) => onChange({ ...ex, notes: e.target.value })}
          />
        </Field>
        <Field
          label="Equipment identifier (keeps machine histories separate)"
          value={ex.equipment}
          placeholder="e.g. Gym A cable station"
          onChange={(e) => onChange({ ...ex, equipment: e.target.value })}
        />
        <Select
          label="Load convention"
          value={ex.convention}
          options={[
            "per-dumbbell",
            "total",
            "bodyweight",
            "machine",
            "added-plates",
            "total-sled",
          ]}
          onChange={(convention) => onChange({ ...ex, convention })}
        />
        <Select
          label="Substitute exercise (starts separate actual sets)"
          value={ex.id}
          options={Object.values(EXERCISES).map((e) => [e.id, e.name])}
          onChange={(id) => {
            if (
              ex.actual.some((s) => s.done) &&
              !window.confirm(
                "Substitution replaces current set entries for this exercise. Continue?",
              )
            )
              return;
            const next = {
              ...ex,
              ...EXERCISES[id],
              substitutedFor: ex.substitutedFor || ex.id,
              min: EXERCISES[id].metric === ex.metric ? ex.min : 10,
              max: EXERCISES[id].metric === ex.metric ? ex.max : 10,
            };
            onChange({
              ...next,
              actual: Array.from({ length: ex.sets }, () =>
                (ex.sides ? ["left", "right"] : [""]).map((side) =>
                  makeSet(next, unit, side),
                ),
              ).flat(),
            });
          }}
        />
        {ex.substitutedFor && (
          <p>
            Substituted for {EXERCISES[ex.substitutedFor]?.name}. The original
            session target is retained.
          </p>
        )}
      </details>
      <label className="fit-check">
        <input
          type="checkbox"
          checked={ex.skipped}
          onChange={(e) => onChange({ ...ex, skipped: e.target.checked })}
        />
        Skip this exercise (keeps existing entries)
      </label>
      {ex.skipped && (
        <Field
          label="Skip reason"
          value={ex.skipReason}
          onChange={(e) => onChange({ ...ex, skipReason: e.target.value })}
        />
      )}
    </Panel>
  );
}
function GlucoseForm({ unit, readings, onChange }) {
  const fresh = () => {
    const d = new Date();
    return {
      value: "",
      unit,
      timing: "before",
      recordedAt: new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
      notes: "",
    };
  };
  const [draft, setDraft] = useState(fresh);
  const [error, setError] = useState("");
  const submit = () => {
    const value = Number(draft.value);
    const mg = convert(value, draft.unit, "mg/dL");
    if (!draft.value || !(mg > 0 && mg <= 1000) || !draft.recordedAt) {
      setError(
        "Check the value, unit and timestamp. Supported entry range is greater than 0 and up to 1000 mg/dL equivalent; this is input validation, not a safe-to-train range.",
      );
      return;
    }
    const reading = {
      ...draft,
      id: crypto.randomUUID(),
      value,
      recordedAt: new Date(draft.recordedAt).toISOString(),
    };
    const filtered =
      draft.timing === "extra"
        ? readings
        : readings.filter((r) => r.timing !== draft.timing);
    onChange([...filtered, reading]);
    setDraft(fresh());
    setError("");
  };
  return (
    <>
      <p>
        Optional. A reading does not establish exercise clearance. Before/after
        readings are paired only within this session; saving a replacement
        updates that side of the pair.
      </p>
      <div className="fit-grid">
        <NumberField
          label={`Glucose (${draft.unit})`}
          value={draft.value}
          onChange={(value) => setDraft({ ...draft, value })}
        />
        <Select
          label="Glucose unit"
          value={draft.unit}
          options={["mg/dL", "mmol/L"]}
          onChange={(next) =>
            setDraft({
              ...draft,
              unit: next,
              value:
                draft.value === ""
                  ? ""
                  : round(
                      convert(draft.value, draft.unit, next),
                      next === "mg/dL" ? 0 : 1,
                    ),
            })
          }
        />
        <Select
          label="Reading timing"
          value={draft.timing}
          options={["before", "after", "extra"]}
          onChange={(timing) => setDraft({ ...draft, timing })}
        />
        <Field
          label="Reading local time"
          type="datetime-local"
          value={draft.recordedAt}
          onChange={(e) => setDraft({ ...draft, recordedAt: e.target.value })}
        />
      </div>
      <Field
        label="Reading notes / symptoms"
        value={draft.notes}
        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
      />
      <button onClick={submit}>Save reading</button>
      {error && <p role="alert">{error}</p>}
      {readings.map((r) => (
        <div className="fit-reading" key={r.id}>
          <span>
            {r.timing}: {r.value} {r.unit} ·{" "}
            {new Date(r.recordedAt).toLocaleString()}
            <small>{r.notes}</small>
          </span>
          <button
            onClick={() => onChange(readings.filter((g) => g.id !== r.id))}
          >
            Remove
          </button>
        </div>
      ))}
    </>
  );
}

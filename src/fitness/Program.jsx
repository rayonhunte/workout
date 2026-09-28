import { useState } from "react";
import {
  baseTemplate,
  phaseFor,
  phaseNames,
  EXERCISES,
  scheduleValid,
  localDate,
} from "./model";
import { Panel, Field, NumberField, Select } from "./ui";

export default function Program({
  profile,
  saveProfile,
  templates,
  put,
  active,
}) {
  const [phase, setPhase] = useState(phaseFor(profile.week));
  const [letter, setLetter] = useState(profile.next);
  const [notice, setNotice] = useState("");
  const template =
    templates.find((t) => t.id === `template-${phase}-${letter}`) ||
    baseTemplate(
      letter,
      phase,
      templates.find((t) => t.id === `template-2-${letter}`),
    );
  return (
    <>
      <Panel title="Twelve weeks, at your pace">
        <p>
          Choose when to move on. Repeat a week or defer a phase when recovery
          or life needs more time.
        </p>
        <div className="fit-weeks">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              disabled={active}
              aria-pressed={week === profile.week}
              onClick={() => {
                saveProfile({ ...profile, week });
                setPhase(phaseFor(week));
              }}
            >
              W{week}
            </button>
          ))}
        </div>
        <p className="fit-muted">
          1–4 Foundation · 5–8 Build · 9–12 Strength / performance
        </p>
        <div className="fit-actions">
          <button
            disabled={active}
            onClick={() => {
              saveProfile({
                ...profile,
                repeats: profile.repeats + 1,
                next: "A",
              });
              setNotice(`Repeating Week ${profile.week}; history kept.`);
            }}
          >
            Repeat this week
          </button>
          <button
            onClick={() => saveProfile({ ...profile, paused: !profile.paused })}
          >
            {profile.paused ? "Resume program" : "Pause program"}
          </button>
        </div>
        {active && <p>Finish the current workout before changing weeks.</p>}
        {profile.week === 12 && (
          <>
            <p>
              Review your real records in Progress. Missing measurements stay
              empty.
            </p>
            <button
              disabled={active}
              onClick={() =>
                saveProfile({
                  ...profile,
                  week: 1,
                  next: "A",
                  startDate: localDate(),
                  nextDate: localDate(),
                  blockId: crypto.randomUUID(),
                })
              }
            >
              Start another 12-week block · keep history
            </button>
          </>
        )}
      </Panel>
      <Schedule profile={profile} save={saveProfile} />
      <Panel title="Review your training targets">
        <div className="fit-grid">
          <Select
            label="Phase"
            value={phase}
            onChange={(v) => setPhase(Number(v))}
            options={phaseNames.map((n, i) => [i + 1, n])}
          />
          <Select
            label="Workout"
            value={letter}
            onChange={setLetter}
            options={["A", "B", "C"]}
          />
        </div>
        <TemplateEditor
          key={`${phase}-${letter}-${template.version}`}
          template={template}
          onSave={(t) => {
            put(`template-${phase}-${letter}`, "template", {
              ...t,
              version: t.version + 1,
              acceptedAt: new Date().toISOString(),
            });
            setNotice(
              "Template saved. Existing sessions keep their original targets.",
            );
          }}
        />
      </Panel>
      {notice && (
        <p role="status" className="fit-notice">
          {notice}
        </p>
      )}
    </>
  );
}
function Schedule({ profile, save }) {
  const [days, setDays] = useState(profile.schedule);
  const [time, setTime] = useState(profile.time);
  const [message, setMessage] = useState("");
  return (
    <Panel title="Your weekly rhythm">
      <p>
        Three nonconsecutive lifting days. Walk 20–40 minutes on recovery days;
        optional easy weekend activity for 30–45 minutes.
      </p>
      <div className="fit-days">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name, i) => (
          <button
            key={name}
            aria-pressed={days.includes(i)}
            onClick={() =>
              setDays(
                days.includes(i) ? days.filter((d) => d !== i) : [...days, i],
              )
            }
          >
            {name}
          </button>
        ))}
      </div>
      <Field
        label="Preferred start time (after 11 AM)"
        type="time"
        min="11:00"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button
        onClick={() => {
          if (!scheduleValid(days) || !time || time < "11:00") {
            setMessage(
              "Choose three nonconsecutive days and a time from 11 AM onward.",
            );
            return;
          }
          save({ ...profile, schedule: days, time });
          setMessage("Schedule saved.");
        }}
      >
        Save schedule
      </button>
      <p role="status">{message}</p>
    </Panel>
  );
}
function TemplateEditor({ template, onSave }) {
  const [draft, setDraft] = useState(template);
  const [error, setError] = useState("");
  const change = (index, patch) =>
    setDraft({
      ...draft,
      exercises: draft.exercises.map((e, i) =>
        i === index ? { ...e, ...patch } : e,
      ),
    });
  const submit = (e) => {
    e.preventDefault();
    if (
      !(draft.rir >= 1 && draft.rir <= 3) ||
      !(draft.cardio.min >= 0 && draft.cardio.max >= draft.cardio.min) ||
      draft.exercises.some(
        (ex) =>
          !(
            ex.sets >= 1 &&
            ex.sets <= 10 &&
            Number.isInteger(ex.sets) &&
            ex.min > 0 &&
            ex.max >= ex.min &&
            ex.rest >= 0
          ),
      )
    ) {
      setError("Check sets, target ranges and rest times.");
      return;
    }
    onSave(draft);
  };
  return (
    <form onSubmit={submit}>
      <p className="fit-badge">{draft.provenance}</p>
      {draft.phase === 2 && (
        <p className="fit-muted">
          Optional proposals: a fourth set on the first lower-body lift and
          first press, farmer carries toward 45–60 sec, sleds toward 5–6 rounds.
          Edit one variable at a time when recovery allows. Accessories stay
          unchanged by default.
        </p>
      )}
      {draft.phase === 3 && draft.letter !== "A" && (
        <p>
          These B/C targets carry forward your accepted Build template. No
          mandatory heavier prescription was supplied.
        </p>
      )}
      <NumberField
        label="Minimum target RIR"
        min="1"
        max="3"
        step="1"
        value={draft.rir}
        onChange={(rir) => setDraft({ ...draft, rir })}
      />
      {draft.exercises.map((ex, i) => (
        <details className="fit-template-row" key={i}>
          <summary>
            {ex.name} · {ex.sets} × {ex.min}–{ex.max} {ex.metric}
          </summary>
          <Select
            label="Exercise / alternative"
            value={ex.id}
            onChange={(id) =>
              change(i, {
                ...EXERCISES[id],
                min: EXERCISES[id].metric === ex.metric ? ex.min : 10,
                max: EXERCISES[id].metric === ex.metric ? ex.max : 10,
              })
            }
            options={Object.values(EXERCISES).map((e) => [e.id, e.name])}
          />
          <div className="fit-grid">
            <NumberField
              label="Working sets / rounds"
              step="1"
              min="1"
              max="10"
              value={ex.sets}
              onChange={(sets) => change(i, { sets })}
            />
            <NumberField
              label="Rest (sec, editable default)"
              value={ex.rest}
              onChange={(rest) => change(i, { rest })}
            />
            <NumberField
              label={`Target min (${ex.metric})`}
              min="1"
              value={ex.min}
              onChange={(min) => change(i, { min })}
            />
            <NumberField
              label={`Target max (${ex.metric})`}
              min="1"
              value={ex.max}
              onChange={(max) => change(i, { max })}
            />
          </div>
          <label className="fit-check">
            <input
              type="checkbox"
              checked={ex.sides}
              onChange={(e) => change(i, { sides: e.target.checked })}
            />
            Separate left / right results
          </label>
          <label className="fit-check">
            <input
              type="checkbox"
              checked={ex.optional}
              onChange={(e) => change(i, { optional: e.target.checked })}
            />
            Optional exercise
          </label>
        </details>
      ))}
      <div className="fit-grid">
        <NumberField
          label="Cardio target min (minutes)"
          value={draft.cardio.min}
          onChange={(min) =>
            setDraft({ ...draft, cardio: { ...draft.cardio, min } })
          }
        />
        <NumberField
          label="Cardio target max (minutes)"
          value={draft.cardio.max}
          onChange={(max) =>
            setDraft({ ...draft, cardio: { ...draft.cardio, max } })
          }
        />
      </div>
      <p role="alert">{error}</p>
      <button className="fit-primary" type="submit">
        Accept & save template
      </button>
    </form>
  );
}

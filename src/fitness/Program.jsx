import { useState } from "react";
import {
  FiActivity,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiEdit2,
  FiSliders,
  FiSun,
} from "react-icons/fi";
import {
  baseTemplate,
  phaseFor,
  phaseNames,
  EXERCISES,
  scheduleValid,
  localDate,
  targetLabel,
} from "./model";
import { Panel, Field, NumberField, Select } from "./ui";

const phases = [
  {
    name: "Foundation",
    range: "Weeks 1–4",
    description: "Find your rhythm. Build good technique.",
  },
  {
    name: "Build",
    range: "Weeks 5–8",
    description: "Gradually build strength and capacity.",
  },
  {
    name: "Strength",
    range: "Weeks 9–12",
    description: "Put your foundation to work.",
  },
];
const weekDays = [1, 2, 3, 4, 5, 6, 0];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const duration = (letter) => (letter === "A" ? "75–85 min" : "75–90 min");
const range = (min, max) => (min === max ? String(min) : `${min}–${max}`);

export default function Program({
  profile,
  saveProfile,
  templates,
  put,
  active,
}) {
  const [previewWeek, setPreviewWeek] = useState(profile.week);
  const [letter, setLetter] = useState(profile.next);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const phase = phaseFor(previewWeek);
  const currentPhase = phaseFor(profile.week);
  const getTemplate = (workout) =>
    templates.find((t) => t.id === `template-${phase}-${workout}`) ||
    baseTemplate(
      workout,
      phase,
      templates.find((t) => t.id === `template-2-${workout}`),
    );
  const template = getTemplate(letter);
  const needsReview =
    phase > 1 && !templates.some((t) => t.id === `template-${phase}-${letter}`);
  const saveTemplate = (t) => {
    put(`template-${phase}-${letter}`, "template", {
      ...t,
      version: t.version + 1,
      acceptedAt: new Date().toISOString(),
    });
    setEditing(false);
    setNotice(
      `Workout ${letter} saved for ${phaseNames[phase - 1]}. Previous sessions keep their targets.`,
    );
  };
  return (
    <div className="fit-program-layout">
      <aside className="fit-program-sidebar" aria-label="Program overview">
        <Panel className="fit-phase-panel">
          <div className="fit-section-heading">
            <h2>Your 12-week plan</h2>
            <span className="fit-badge">
              {profile.paused ? "Paused" : `Week ${profile.week} of 12`}
            </span>
          </div>
          <p className="fit-muted">Three phases. Progress at your pace.</p>
          <div className="fit-phase-list" aria-label="Browse phases">
            {phases.map((item, i) => (
              <button
                key={item.name}
                className="fit-phase-option"
                aria-label={`Browse ${item.name} phase`}
                aria-pressed={phase === i + 1}
                disabled={editing}
                onClick={() =>
                  setPreviewWeek(
                    currentPhase === i + 1 ? profile.week : i * 4 + 1,
                  )
                }
              >
                <span className="fit-phase-number">0{i + 1}</span>
                <span className="fit-phase-copy">
                  <strong>{item.name}</strong>
                  <small>
                    {item.range}
                    {currentPhase === i + 1 ? " · Current phase" : ""}
                  </small>
                </span>
                <FiArrowRight aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="fit-week-heading">
            <span>Explore {phases[phase - 1].name.toLowerCase()}</span>
            <span>Week {previewWeek}</span>
          </div>
          <div className="fit-week-picker" aria-label="Browse weeks">
            {Array.from({ length: 4 }, (_, i) => (phase - 1) * 4 + i + 1).map(
              (week) => (
                <button
                  key={week}
                  disabled={editing}
                  aria-label={`Preview Week ${week}`}
                  aria-pressed={previewWeek === week}
                  aria-current={week === profile.week ? "step" : undefined}
                  onClick={() => setPreviewWeek(week)}
                >
                  {week}
                  <span
                    className="fit-current-dot"
                    aria-hidden="true"
                    style={{
                      visibility: week === profile.week ? "visible" : "hidden",
                    }}
                  />
                </button>
              ),
            )}
          </div>
          {previewWeek !== profile.week ? (
            <div className="fit-week-preview">
              <p>
                Previewing Week {previewWeek}. You’re still on Week{" "}
                {profile.week}.
              </p>
              <button
                className="fit-primary"
                disabled={active || editing}
                onClick={() => {
                  saveProfile({ ...profile, week: previewWeek });
                  setNotice(
                    `Week ${previewWeek} is now your current week. Review any new targets before training.`,
                  );
                }}
              >
                Make Week {previewWeek} current
              </button>
              {active && <p>Finish your workout before changing weeks.</p>}
            </div>
          ) : (
            <p className="fit-phase-description">
              {phases[phase - 1].description}
            </p>
          )}
          <details className="fit-program-controls">
            <summary>Adjust your program</summary>
            <p>
              Repeat a week or pause whenever you need. Your history stays with
              you.
            </p>
            <div className="fit-actions">
              <button
                disabled={active || editing}
                onClick={() => {
                  saveProfile({
                    ...profile,
                    repeats: profile.repeats + 1,
                    next: "A",
                  });
                  setPreviewWeek(profile.week);
                  setNotice(`Repeating Week ${profile.week}; history kept.`);
                }}
              >
                Repeat this week
              </button>
              <button
                onClick={() =>
                  saveProfile({ ...profile, paused: !profile.paused })
                }
              >
                {profile.paused ? "Resume program" : "Pause program"}
              </button>
            </div>
            {profile.week === 12 && (
              <button
                disabled={active || editing}
                onClick={() => {
                  saveProfile({
                    ...profile,
                    week: 1,
                    next: "A",
                    startDate: localDate(),
                    nextDate: localDate(),
                    blockId: crypto.randomUUID(),
                  });
                  setPreviewWeek(1);
                  setLetter("A");
                }}
              >
                Start another block · keep history
              </button>
            )}
          </details>
        </Panel>
        <Schedule profile={profile} save={saveProfile} />
      </aside>
      <div className="fit-program-main">
        <div className="fit-workouts-heading">
          <div>
            <span className="fit-eyebrow">
              {phaseNames[phase - 1]} · Week {previewWeek}
            </span>
            <h2>Your workouts</h2>
          </div>
          <span className="fit-muted">3 sessions / week</span>
        </div>
        <div className="fit-workout-cards" aria-label="Choose a workout">
          {["A", "B", "C"].map((workout) => {
            const t = getTemplate(workout);
            return (
              <button
                key={workout}
                className="fit-workout-card"
                aria-label={`View Workout ${workout}`}
                aria-pressed={letter === workout}
                disabled={editing}
                onClick={() => setLetter(workout)}
              >
                <span className="fit-card-top">
                  <span className="fit-workout-letter">{workout}</span>
                  {letter === workout && <FiCheck aria-hidden="true" />}
                </span>
                <strong>{t.name}</strong>
                <span className="fit-card-meta">
                  {t.exercises.length} exercises
                  <span aria-hidden="true"> · </span>
                  {duration(workout)}
                </span>
              </button>
            );
          })}
        </div>
        <section
          className="fit-panel fit-workout-preview"
          aria-label={`Workout ${letter} details`}
        >
          <div className="fit-workout-heading">
            <div>
              <span className="fit-eyebrow">{phaseNames[phase - 1]}</span>
              <h2>
                {editing ? `Customize Workout ${letter}` : `Workout ${letter}`}
              </h2>
              <p className="fit-muted">{template.name}</p>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}>
                <FiSliders aria-hidden="true" />
                Customize workout
              </button>
            )}
          </div>
          {editing ? (
            <TemplateEditor
              key={`${phase}-${letter}-${template.version}`}
              template={template}
              onSave={saveTemplate}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <div className="fit-workout-facts">
                <span>
                  <FiClock aria-hidden="true" />
                  {duration(letter)}
                </span>
                <span>
                  <FiActivity aria-hidden="true" />
                  {template.rir}–{template.rir + 1} reps in reserve
                </span>
              </div>
              {needsReview && (
                <div className="fit-proposal">
                  <strong>Suggested targets · review before training</strong>
                  <p>
                    {phase === 3 && letter !== "A"
                      ? "Carried forward from your Build workout. Adjust these targets to suit your recovery."
                      : "These are proposed targets for this phase. Review the workout below and customize anything you need."}
                  </p>
                </div>
              )}
              <div className="fit-workout-guide">
                <FiSun aria-hidden="true" />
                <div>
                  <strong>Start with an easy warm-up</strong>
                  <span>8–10 minutes of movement and mobility</span>
                </div>
              </div>
              <div className="fit-exercise-columns">
                <span>Exercise</span>
                <span>Working sets</span>
              </div>
              <ol className="fit-plan-exercises">
                {template.exercises.map((ex, i) => (
                  <li key={`${ex.id}-${i}`}>
                    <span className="fit-plan-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="fit-plan-name">
                      {ex.name}
                      {ex.optional && <small>Optional accessory</small>}
                    </span>
                    <span className="fit-plan-target">{targetLabel(ex)}</span>
                  </li>
                ))}
              </ol>
              <div className="fit-workout-guide fit-cardio-guide">
                <FiActivity aria-hidden="true" />
                <div>
                  <strong>
                    Finish with {template.cardio.modality.toLowerCase()}
                  </strong>
                  <span>
                    {range(template.cardio.min, template.cardio.max)} minutes ·
                    conversational pace
                  </span>
                </div>
              </div>
              <p className="fit-workout-footnote">
                Leave {template.rir}–{template.rir + 1} good-form reps in
                reserve. Rest as long as you need between sets.
              </p>
              {needsReview && (
                <button
                  className="fit-primary fit-accept-targets"
                  onClick={() => saveTemplate(template)}
                >
                  Use these targets <FiCheck aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </section>
        {notice && (
          <p role="status" className="fit-notice">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
function Schedule({ profile, save }) {
  const [editing, setEditing] = useState(false);
  const [days, setDays] = useState(profile.schedule);
  const [time, setTime] = useState(profile.time);
  const [message, setMessage] = useState("");
  const orderedDays = weekDays.filter((day) => profile.schedule.includes(day));
  return (
    <Panel className="fit-schedule-panel">
      <div className="fit-section-heading">
        <h2>Weekly rhythm</h2>
        {!editing && (
          <button
            aria-label="Edit schedule"
            onClick={() => {
              setDays(profile.schedule);
              setTime(profile.time);
              setMessage("");
              setEditing(true);
            }}
          >
            <FiEdit2 aria-hidden="true" />
            <span>Edit</span>
          </button>
        )}
      </div>
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!scheduleValid(days) || !time || time < "11:00") {
              setMessage(
                "Choose three nonconsecutive days and a time from 11 AM onward.",
              );
              return;
            }
            save({ ...profile, schedule: days, time });
            setEditing(false);
            setMessage("Schedule saved.");
          }}
        >
          <p>Choose three nonconsecutive lifting days.</p>
          <div className="fit-days">
            {weekDays.map((day) => (
              <button
                type="button"
                key={day}
                aria-pressed={days.includes(day)}
                onClick={() =>
                  setDays(
                    days.includes(day)
                      ? days.filter((d) => d !== day)
                      : [...days, day],
                  )
                }
              >
                {dayNames[day]}
              </button>
            ))}
          </div>
          <Field
            label="Preferred start time (after 11 AM)"
            type="time"
            min="11:00"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <div className="fit-actions">
            <button className="fit-primary" type="submit">
              Save schedule
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="fit-muted">
            <FiClock aria-hidden="true" /> {profile.time} preferred start
          </p>
          <div className="fit-week-strip" aria-label="Weekly training schedule">
            {weekDays.map((day) => {
              const index = orderedDays.indexOf(day);
              const lifting = index !== -1;
              return (
                <div
                  key={day}
                  className={`fit-day-tile ${lifting ? "is-lifting" : ""}`}
                  aria-label={`${dayNames[day]}: ${lifting ? `Workout ${"ABC"[index]}` : "Recovery"}`}
                >
                  <span>{dayNames[day]}</span>
                  <strong>
                    {lifting ? "ABC"[index] : <span aria-hidden="true">·</span>}
                  </strong>
                </div>
              );
            })}
          </div>
          <p className="fit-schedule-note">
            A little movement between lifting days. Walk, stretch, or take it
            easy.
          </p>
          <details>
            <summary>Recovery day ideas</summary>
            <p>
              20–40 minutes walking or mobility on recovery days. Optional
              weekend activity: 30–45 minutes of easy movement.
            </p>
          </details>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </Panel>
  );
}
function TemplateEditor({ template, onSave, onCancel }) {
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
            {ex.name} · {targetLabel(ex)}
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
      <div className="fit-actions">
        <button className="fit-primary" type="submit">
          Save workout
        </button>
        <button type="button" onClick={onCancel}>
          Cancel changes
        </button>
      </div>
    </form>
  );
}

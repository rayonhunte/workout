import { useState } from "react";
import { convert, round } from "./model";
import { Panel, Field, NumberField, Select } from "./ui";
import { downloadJson } from "./export";
export default function Settings({ profile, save, data, onSignOut }) {
  const [draft, setDraft] = useState(profile);
  const [message, setMessage] = useState("");
  const set = (patch) => setDraft({ ...draft, ...patch });
  return (
    <>
      <Panel title="Make the plan yours">
        <p>
          Optional details stay in your account. No intake is required to log a
          workout.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(draft);
            setMessage("Preferences saved.");
          }}
        >
          <div className="fit-grid">
            <Select
              label="Load / body weight unit"
              value={draft.unit}
              options={["lb", "kg"]}
              onChange={(unit) =>
                set({
                  unit,
                  goalWeight:
                    draft.goalWeight == null
                      ? null
                      : round(convert(draft.goalWeight, draft.unit, unit), 1),
                  startingWeight:
                    draft.startingWeight == null
                      ? null
                      : round(
                          convert(draft.startingWeight, draft.unit, unit),
                          1,
                        ),
                })
              }
            />
            <Select
              label="Waist unit"
              value={draft.waistUnit}
              options={["in", "cm"]}
              onChange={(waistUnit) => set({ waistUnit })}
            />
            <Select
              label="Glucose display unit"
              value={draft.glucoseUnit}
              options={["mg/dL", "mmol/L"]}
              onChange={(glucoseUnit) => set({ glucoseUnit })}
            />
            <NumberField
              label={`Goal weight (${draft.unit}, optional)`}
              value={draft.goalWeight}
              onChange={(goalWeight) => set({ goalWeight })}
            />
            <NumberField
              label={`Starting weight context (${draft.unit}, not a measurement)`}
              value={draft.startingWeight}
              onChange={(startingWeight) => set({ startingWeight })}
            />
            <NumberField
              label="Age (optional)"
              min="1"
              max="120"
              step="1"
              value={draft.age}
              onChange={(age) => set({ age })}
            />
            <NumberField
              label="Height (cm, optional)"
              value={draft.heightCm}
              onChange={(heightCm) => set({ heightCm })}
            />
            <NumberField
              label="Longer-term weekly aerobic aim (minutes)"
              value={draft.weeklyCardio}
              onChange={(weeklyCardio) => set({ weeklyCardio })}
            />
          </div>
          <p className="fit-muted">
            Build toward your aerobic aim gradually. It is not a quota or
            medical clearance.
          </p>
          <Field label="Goals">
            <textarea
              value={draft.goals}
              onChange={(e) => set({ goals: e.target.value })}
            />
          </Field>
          <Field label="Private context (limitations, medication notes, eating preferences)">
            <textarea
              value={draft.healthNotes}
              onChange={(e) => set({ healthNotes: e.target.value })}
            />
          </Field>
          <Field label="Your clinician-provided safety plan">
            <textarea
              rows="5"
              value={draft.safetyPlan}
              onChange={(e) => set({ safetyPlan: e.target.value })}
            />
          </Field>
          <button className="fit-primary" type="submit">
            Save preferences
          </button>
          <p role="status">{message}</p>
        </form>
      </Panel>
      <Panel title="Your data">
        <p>
          Drafts and account records are cached in this browser so you can
          resume. Use a trusted device. Unit conversions use 1 lb = 0.45359237
          kg, 1 in = 2.54 cm and 1 mmol/L glucose = 18.0182 mg/dL. Displays
          round to one decimal (loads to two); original readings retain their
          entered unit.
        </p>
        <button
          onClick={() => downloadJson("fitness-records.json", data.records)}
        >
          Export program records
        </button>
        <p className="fit-muted">
          Previous workouts and meter/CGM records stay in the original tools.
          This export contains the new program records only.
        </p>
        <button
          disabled={data.pending > 0 || Object.keys(data.conflicts).length > 0}
          onClick={() => {
            data.store.clearDevice();
            onSignOut();
          }}
        >
          Clear synced device cache & sign out
        </button>
        <button onClick={onSignOut}>Sign out · keep device drafts</button>
      </Panel>
    </>
  );
}

import Review from "./Review";
import { useState } from "react";
import { convert, round, localDate, weekStart, glucosePairs } from "./model";
import { Panel, Field, NumberField, Select } from "./ui";
export default function Progress({ records, profile, put }) {
  const [measure, setMeasure] = useState({
    type: "weight",
    value: null,
    date: localDate(),
    unit: profile.unit,
  });
  const [activity, setActivity] = useState({
    modality: "Walking",
    minutes: null,
    date: localDate(),
    distance: null,
    distanceUnit: "km",
    effort: "Easy / conversational",
  });
  const [error, setError] = useState("");
  const measurements = records
    .filter((r) => r.kind === "measurement")
    .sort((a, b) => a.date.localeCompare(b.date));
  const sessions = records.filter(
    (r) => r.kind === "session" && ["completed", "partial"].includes(r.status),
  );
  const activities = records.filter((r) => r.kind === "activity");
  const start = weekStart(),
    today = localDate();
  const within = (r) => r.date >= start && r.date <= today;
  const minutes =
    sessions
      .filter(within)
      .reduce((total, s) => total + (s.cardio.minutes || 0), 0) +
    activities.filter(within).reduce((total, a) => total + a.minutes, 0);
  const pairs = glucosePairs(sessions, profile.glucoseUnit);
  const histories = sessions.flatMap((s) =>
    s.exercises
      .filter((e) => !e.skipped)
      .flatMap((e) =>
        e.actual
          .filter((a) => a.done && !a.warmup)
          .map((a) => ({
            ...a,
            exercise: e.name,
            convention: e.convention,
            equipment: e.equipment,
            date: s.date,
            week: s.week,
            metric: e.metric,
            sessionId: s.id,
          })),
      ),
  );
  const [selected, setSelected] = useState("");
  const exerciseNames = [...new Set(histories.map((h) => h.exercise))];
  const selectedHistory = histories.filter(
    (h) => h.exercise === (selected || exerciseNames[0]),
  );
  return (
    <>
      <Panel title="Progress you can see">
        <p>
          Use real measurements and comparable sets. Weight is one part of the
          picture; consistency, waist, work capacity and strength matter too.
        </p>
        <div className="fit-stats">
          <div>
            <strong>{round(minutes)}</strong>
            <span>Aerobic min this week</span>
          </div>
          <div>
            <strong>{sessions.filter(within).length}</strong>
            <span>Lifting sessions</span>
          </div>
          <div>
            <strong>{activities.filter(within).length}</strong>
            <span>Recovery activities</span>
          </div>
        </div>
        <p className="fit-muted">
          Week starts Monday, using each entry’s local date. Longer-term aim:{" "}
          {profile.weeklyCardio} min; build gradually.
        </p>
      </Panel>
      {["weight", "waist"].map((type) => {
        const list = measurements.filter((m) => m.type === type);
        const unit = type === "weight" ? profile.unit : profile.waistUnit;
        const first = list[0],
          last = list.at(-1);
        return (
          <Panel
            key={type}
            title={
              type === "weight"
                ? "Body weight · weekly check-in"
                : "Waist · monthly check-in"
            }
          >
            {first ? (
              <>
                <div className="fit-measure-summary">
                  <strong>
                    {round(convert(last.value, last.unit, unit))} {unit}
                  </strong>
                  <span>
                    {round(
                      convert(last.value, last.unit, unit) -
                        convert(first.value, first.unit, unit),
                    )}{" "}
                    {unit} from first logged measurement
                  </span>
                </div>
                <Trend records={list} unit={unit} />
                <div className="fit-history-small">
                  {list.map((m) => (
                    <button key={m.id} onClick={() => setMeasure({ ...m })}>
                      {m.date}: {m.value} {m.unit} · edit
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="fit-muted">
                No {type} measurements yet. Your first entry becomes the
                baseline.
              </p>
            )}
            {type === "weight" && profile.goalWeight != null && (
              <p>
                Goal: {profile.goalWeight} {profile.unit}. No promised
                completion date.
              </p>
            )}
          </Panel>
        );
      })}
      <Panel title="Log a measurement">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!(measure.value > 0) || !measure.date) {
              setError("Enter a positive measurement and date.");
              return;
            }
            const id = measure.id || crypto.randomUUID();
            put(id, "measurement", { ...measure, id });
            setMeasure({ ...measure, id: undefined, value: null });
            setError("Measurement saved.");
          }}
        >
          <div className="fit-grid">
            <Select
              label="Measurement"
              value={measure.type}
              options={["weight", "waist"]}
              onChange={(type) =>
                setMeasure({
                  type,
                  unit: type === "weight" ? profile.unit : profile.waistUnit,
                  date: measure.date,
                  value: null,
                })
              }
            />
            <NumberField
              label={`Value (${measure.unit})`}
              min="0.1"
              required
              value={measure.value}
              onChange={(value) => setMeasure({ ...measure, value })}
            />
            <Select
              label="Measurement unit"
              value={measure.unit}
              options={measure.type === "weight" ? ["lb", "kg"] : ["in", "cm"]}
              onChange={(unit) =>
                setMeasure({
                  ...measure,
                  unit,
                  value:
                    measure.value == null
                      ? null
                      : round(convert(measure.value, measure.unit, unit)),
                })
              }
            />
            <Field
              label="Measurement date"
              type="date"
              required
              value={measure.date}
              onChange={(e) => setMeasure({ ...measure, date: e.target.value })}
            />
          </div>
          <button className="fit-primary" type="submit">
            {measure.id ? "Save correction" : "Save measurement"}
          </button>
        </form>
      </Panel>
      <Panel title="Recovery & cardio">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!(activity.minutes > 0) || !activity.date) {
              setError("Enter positive minutes and a date.");
              return;
            }
            const id = activity.id || crypto.randomUUID();
            put(id, "activity", { ...activity, id });
            setActivity({ ...activity, id: undefined, minutes: null });
            setError("Activity saved.");
          }}
        >
          <Field
            label="Activity modality"
            required
            value={activity.modality}
            onChange={(e) =>
              setActivity({ ...activity, modality: e.target.value })
            }
          />
          <div className="fit-grid">
            <NumberField
              label="Actual activity minutes"
              min="0.1"
              required
              value={activity.minutes}
              onChange={(minutes) => setActivity({ ...activity, minutes })}
            />
            <Field
              label="Activity date"
              type="date"
              required
              value={activity.date}
              onChange={(e) =>
                setActivity({ ...activity, date: e.target.value })
              }
            />
            <NumberField
              label={`Activity distance (${activity.distanceUnit}, optional)`}
              value={activity.distance}
              onChange={(distance) => setActivity({ ...activity, distance })}
            />
            <Select
              label="Activity distance unit"
              value={activity.distanceUnit}
              options={["km", "mi", "m"]}
              onChange={(unit) =>
                setActivity({
                  ...activity,
                  distanceUnit: unit,
                  distance:
                    activity.distance == null
                      ? null
                      : round(
                          convert(
                            activity.distance,
                            activity.distanceUnit,
                            unit,
                          ),
                          2,
                        ),
                })
              }
            />
          </div>
          <Field
            label="Activity effort"
            value={activity.effort}
            onChange={(e) =>
              setActivity({ ...activity, effort: e.target.value })
            }
          />
          <button type="submit" className="fit-primary">
            {activity.id ? "Save activity correction" : "Save activity"}
          </button>
        </form>
        <div className="fit-history-small">
          {[...activities]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((a) => (
              <button key={a.id} onClick={() => setActivity(a)}>
                {a.date} · {a.modality} · {a.minutes} min · edit
              </button>
            ))}
        </div>
      </Panel>
      {error && (
        <p role="status" className="fit-notice">
          {error}
        </p>
      )}
      <Panel title="Strength & carries">
        {histories.length ? (
          <>
            <Select
              label="Exercise history"
              value={selected || exerciseNames[0]}
              onChange={setSelected}
              options={exerciseNames}
            />
            <p className="fit-muted">
              Compare reps, load and RIR together. Different equipment or load
              conventions remain distinct; heavier does not automatically mean
              better.
            </p>
            <div className="fit-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Load / equipment</th>
                    <th>Actual</th>
                    <th>RIR</th>
                  </tr>
                </thead>
                <tbody>
                  {[...selectedHistory]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((h) => (
                      <tr key={`${h.sessionId}-${h.id}`}>
                        <td>
                          {h.date}
                          <small>Week {h.week}</small>
                        </td>
                        <td>
                          {h.load ?? "—"} {h.unit}
                          <small>
                            {h.convention} {h.equipment}
                          </small>
                        </td>
                        <td>
                          {h.reps ?? h.seconds ?? h.distance}{" "}
                          {h.metric === "seconds"
                            ? "sec"
                            : h.metric === "distance"
                              ? h.distanceUnit
                              : "reps"}{" "}
                          {h.side}
                        </td>
                        <td>{h.rir ?? "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="fit-muted">
            Completed working sets appear here after you finish a session.
          </p>
        )}
      </Panel>
      <Panel title="Paired glucose observations">
        <p>
          {pairs.length} session pair{pairs.length === 1 ? "" : "s"} ·{" "}
          {sessions.length - pairs.length} sessions without a complete pair.
        </p>
        {pairs.length > 0 && (
          <>
            <p>
              Average after-minus-before:{" "}
              {round(pairs.reduce((n, p) => n + p.delta, 0) / pairs.length)}{" "}
              {profile.glucoseUnit}
            </p>
            {pairs.map((p, i) => (
              <p key={i}>
                {p.date}: {round(p.delta)} {profile.glucoseUnit}
              </p>
            ))}
          </>
        )}
        <p className="fit-muted">
          Descriptive observations only. These do not show causation or
          medication effectiveness. Extra readings and unpaired readings are not
          mixed into the average.
        </p>
      </Panel>
      <Review
        profile={profile}
        sessions={sessions}
        measurements={measurements}
        activities={activities}
      />
    </>
  );
}
function Trend({ records, unit }) {
  const values = records.map((r) => convert(r.value, r.unit, unit));
  const min = Math.min(...values),
    max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map(
      (v, i) =>
        `${20 + (i / (values.length - 1 || 1)) * 280},${80 - ((v - min) / span) * 60}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 320 100"
      role="img"
      aria-label={`Measurement trend in ${unit}, ${records.length} entries from ${records[0].date} to ${records.at(-1).date}`}
      className="fit-trend"
    >
      <path d="M20 85H300" stroke="currentColor" opacity=".15" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {points.split(" ").map((p, i) => (
        <circle
          key={i}
          cx={p.split(",")[0]}
          cy={p.split(",")[1]}
          r="4"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

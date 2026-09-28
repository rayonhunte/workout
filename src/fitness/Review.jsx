import { Panel } from "./ui";
import { convert, round, weekStart } from "./model";

export default function Review({
  profile,
  sessions,
  measurements,
  activities,
}) {
  const block = sessions
    .filter((s) => s.blockId === profile.blockId)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const body = measurements.filter((m) => m.date >= profile.startDate);
  const groups = new Map();
  for (const session of block)
    for (const ex of session.exercises) {
      if (ex.skipped) continue;
      for (const set of ex.actual.filter((s) => s.done && !s.warmup)) {
        const key = JSON.stringify([
          ex.id,
          ex.convention,
          ex.equipment,
          set.unit,
          set.side,
        ]);
        const row = {
          name: ex.name,
          convention: ex.convention,
          equipment: ex.equipment,
          side: set.side,
          date: session.date,
          set,
          metric: ex.metric,
        };
        if (!groups.has(key))
          groups.set(key, { first: row, last: row, count: 1 });
        else {
          const group = groups.get(key);
          group.last = row;
          group.count++;
        }
      }
    }
  const totals = new Map();
  for (const row of [
    ...block.map((s) => ({ date: s.date, minutes: s.cardio.minutes || 0 })),
    ...activities.filter((a) => a.date >= profile.startDate),
  ]) {
    const week = weekStart(row.date);
    totals.set(week, (totals.get(week) || 0) + row.minutes);
  }
  const weeks = [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const display = (row) =>
    `${row.set.load ?? "—"} ${row.set.unit} × ${row.set.reps ?? row.set.seconds ?? row.set.distance} ${row.metric === "reps" ? "reps" : row.metric === "seconds" ? "sec" : row.set.distanceUnit}; RIR ${row.set.rir ?? "unknown"}`;
  return (
    <Panel title="Week 12 review">
      <p>
        Current block since {profile.startDate}:{" "}
        {block.filter((s) => s.status === "completed").length} completed and{" "}
        {block.filter((s) => s.status === "partial").length} partial sessions.
        Baselines below come from actual logs.
      </p>
      <div className="fit-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Measurement</th>
              <th>First</th>
              <th>Latest</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {["weight", "waist"].map((type) => {
              const list = body.filter((m) => m.type === type);
              const unit = type === "weight" ? profile.unit : profile.waistUnit;
              const first = list[0],
                last = list.at(-1);
              return (
                <tr key={type}>
                  <td>
                    {type} ({unit})
                  </td>
                  <td>
                    {first
                      ? round(convert(first.value, first.unit, unit))
                      : "—"}
                  </td>
                  <td>
                    {last ? round(convert(last.value, last.unit, unit)) : "—"}
                  </td>
                  <td>
                    {list.length > 1
                      ? round(
                          convert(last.value, last.unit, unit) -
                            convert(first.value, first.unit, unit),
                        )
                      : "Need two entries"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {weeks.length > 0 ? (
        <p>
          Aerobic minutes: {round(weeks[0][1])} in the first logged week (
          {weeks[0][0]}) → {round(weeks.at(-1)[1])} in the latest (
          {weeks.at(-1)[0]}). Recovery activity is included; incomplete weeks
          may not be comparable.
        </p>
      ) : (
        <p>No aerobic records in this block yet.</p>
      )}
      <details>
        <summary>First and latest strength / carry sets</summary>
        <p className="fit-muted">
          Same exercise, equipment, unit, load convention and side. First/latest
          sets are observations, not automatically personal records. Consider
          reps, RIR, technique and fatigue together.
        </p>
        {groups.size === 0 ? (
          <p>No completed working sets in this block yet.</p>
        ) : (
          [...groups.entries()].map(([key, g]) => (
            <div key={key} className="fit-review-set">
              <h3>
                {g.first.name} {g.first.side}
              </h3>
              <small>
                {g.first.convention} ·{" "}
                {g.first.equipment || "equipment unspecified"}
              </small>
              <p>
                First ({g.first.date}): {display(g.first)}
                <br />
                Latest ({g.last.date}): {display(g.last)}
              </p>
              {g.count === 1 && <small>Only one comparable set so far.</small>}
            </div>
          ))
        )}
      </details>
      <p>
        Keep what worked; adapt what did not. In Program, repeat a week or start
        another block without resetting records.
      </p>
    </Panel>
  );
}

import { useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiSettings,
  FiCheck,
} from "react-icons/fi";
import { useFitness } from "./useFitness";
import {
  defaultProfile,
  baseTemplate,
  phaseFor,
  phaseNames,
  createSession,
  advanceProfile,
  localDate,
  targetLabel,
  canSchedule,
} from "./model";
import { Panel, Field } from "./ui";
import { downloadJson } from "./export";
import Session from "./Session";
import Program from "./Program";
import Progress from "./Progress";
import Settings from "./Settings";
import Safety from "./Safety";
import ThemeToggle from "../components/ThemeToggle";
import "./fitness.css";

export default function FitnessApp({ uid, onLegacy, onSignOut }) {
  const data = useFitness(uid);
  const initial = useMemo(() => defaultProfile(), []);
  const profile = data.records.find((r) => r.kind === "profile") || initial;
  const [tab, setTab] = useState("Today");
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const sessions = data.records.filter((r) => r.kind === "session");
  const templates = data.records.filter((r) => r.kind === "template");
  const phase = phaseFor(profile.week);
  const templateFor = (letter, p = phase) =>
    templates.find((t) => t.id === `template-${p}-${letter}`) ||
    baseTemplate(
      letter,
      p,
      templates.find((t) => t.id === `template-2-${letter}`),
    );
  const nextTemplate = templateFor(profile.next);
  const active = sessions.find((s) => s.status === "in-progress");
  const session = sessions.find((s) => s.id === selected);
  const saveProfile = (p) => data.put("profile", "profile", p);
  const start = (skip = false) => {
    if (active) {
      setSelected(active.id);
      return;
    }
    if (
      phase > 1 &&
      !templates.some((t) => t.id === `template-${phase}-${profile.next}`)
    ) {
      setTab("Program");
      setNotice(
        "Review and save this phase’s template before starting. Later-phase defaults are proposals.",
      );
      return;
    }
    const next = createSession(nextTemplate, profile, sessions, skip);
    if (skip) next.notes = "Skipped from Today; no catch-up session added.";
    data.put(next.id, "session", next);
    saveProfile(skip ? advanceProfile(profile, next) : profile);
    if (!skip) setSelected(next.id);
  };
  if (data.acquiring)
    return (
      <div className="fitness">
        <p role="status">Opening your training space…</p>
      </div>
    );
  if (data.locked)
    return (
      <div className="fitness">
        <Panel title="Your program is open in another tab">
          <p>
            Continue there, or close that tab and reload this one. This protects
            your device drafts from competing edits.
          </p>
          <button onClick={() => window.location.reload()}>Reload</button>
          <button onClick={onLegacy}>Previous workouts</button>
        </Panel>
      </div>
    );
  const syncLabel = data.error
    ? "Sync needs attention"
    : !data.ready && data.records.length === 0
      ? "Loading…"
      : !data.online
        ? "Offline · saved on device"
        : data.pending
          ? "Saving…"
          : "Saved";
  const title = session
    ? "Your workout"
    : {
        Today: "Today",
        Program: "Your program",
        Progress: "Your progress",
        Settings: "Your preferences",
      }[tab];
  return (
    <div
      className={`fitness ${tab === "Program" && !session ? "fitness-program" : ""}`}
    >
      <header className="fit-header fit-header-compact">
        <div>
          <span className="fit-eyebrow">WORKOUT</span>
          <h1>{title}</h1>
          <p className="fit-header-subtitle">
            Week {profile.week} <span aria-hidden="true">·</span>{" "}
            {phaseNames[phase - 1]}
            {profile.paused ? " · Paused" : ""}
          </p>
        </div>
        <div className="fit-header-tools">
          <div
            className={`fit-save-indicator ${data.error ? "needs-attention" : ""}`}
            role="status"
            title={
              syncLabel === "Saved" ? "Saved · synced with cloud" : syncLabel
            }
          >
            {syncLabel === "Saved" && <FiCheck aria-hidden="true" />}
            {syncLabel}
            {syncLabel === "Saved" && (
              <span className="sr-only"> · synced with cloud</span>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>
      {(data.error || !data.online || data.pending > 0) && (
        <div className={`fit-sync ${data.error ? "fit-error" : ""}`}>
          <span>
            {data.error ||
              (!data.online
                ? "Drafts stay on this device until you reconnect."
                : "Your changes are saved on this device and waiting to sync.")}
          </span>
          {(data.error || data.pending > 0) && (
            <button onClick={() => data.store.retry()}>Retry sync</button>
          )}
          {data.error && (
            <button
              onClick={() =>
                downloadJson("fitness-recovery.json", {
                  records: data.store.records,
                  unreadableCache: data.store.corruptCache,
                })
              }
            >
              Export device backup
            </button>
          )}
        </div>
      )}
      {Object.keys(data.conflicts).map((id) => (
        <Panel key={id} title="Another device changed this record">
          <p>
            Your draft and the cloud version differ. Export a backup before
            choosing which version to keep.
          </p>
          <div className="fit-actions">
            <button
              onClick={() =>
                downloadJson("fitness-conflict.json", {
                  local: data.store.records[id],
                  cloud: data.conflicts[id],
                })
              }
            >
              Export both versions
            </button>
            <button onClick={() => data.store.resolve(id, true)}>
              Keep my draft
            </button>
            <button onClick={() => data.store.resolve(id, false)}>
              Use cloud version
            </button>
          </div>
        </Panel>
      ))}
      {notice && (
        <div className="fit-notice" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      {session ? (
        <Session
          key={session.id}
          session={session}
          sessions={sessions}
          profile={profile}
          save={(s) => data.put(s.id, "session", s)}
          onBack={() => setSelected(null)}
          onFinish={(s) => {
            data.put(s.id, "session", s);
            if (session.status === "in-progress")
              saveProfile(advanceProfile(profile, s));
            setSelected(null);
            setNotice(
              s.status === "completed"
                ? "Workout saved. Take time to recover."
                : "Partial workout saved. Your completed sets count.",
            );
          }}
        />
      ) : (
        <>
          <nav className="fit-tabs" aria-label="Fitness navigation">
            {[
              ["Today", <FiActivity />],
              ["Program", <FiCalendar />],
              ["Progress", <FiBarChart2 />],
              ["Settings", <FiSettings />],
            ].map(([name, icon]) => (
              <button
                key={name}
                aria-current={tab === name ? "page" : undefined}
                onClick={() => setTab(name)}
              >
                {icon}
                <span>{name}</span>
              </button>
            ))}
          </nav>
          {tab === "Today" && (
            <>
              <section className="fit-hero">
                <div className="fit-eyebrow">
                  WEEK {profile.week} OF 12 ·{" "}
                  {phaseNames[phase - 1].toUpperCase()}
                </div>
                <h2>
                  {active ? "Ready when you are." : `Workout ${profile.next}`}
                </h2>
                <p>{active ? active.name : nextTemplate.name}</p>
                <p className="fit-muted">
                  {active
                    ? "Your session is saved. Pick up where you left off."
                    : `Planned ${profile.nextDate} at ${profile.time} · about 75–90 minutes`}
                </p>
                <button
                  className="fit-primary"
                  disabled={
                    (profile.paused && !active) ||
                    (!data.ready && data.online && data.records.length === 0)
                  }
                  onClick={() => start()}
                >
                  {active ? "Resume workout" : `Start Workout ${profile.next}`}{" "}
                  <span aria-hidden="true">→</span>
                </button>
                {profile.paused && (
                  <p>Program paused. Resume in Program when you’re ready.</p>
                )}
              </section>
              <div className="fit-stats">
                <div>
                  <strong>
                    {sessions.filter((s) => s.status === "completed").length}
                  </strong>
                  <span>Completed</span>
                </div>
                <div>
                  <strong>
                    {sessions.filter((s) => s.status === "partial").length}
                  </strong>
                  <span>Partial sessions</span>
                </div>
                <div>
                  <strong>{profile.week}</strong>
                  <span>Your week</span>
                </div>
              </div>
              <Panel title="Your next session">
                <p className="fit-muted">
                  Warm up for 8–10 minutes: easy walking, hip mobility, shoulder
                  circles and comfortable bodyweight squats.
                </p>
                <ol className="fit-exercise-list">
                  {nextTemplate.exercises.map((e, i) => (
                    <li key={`${e.id}-${i}`}>
                      <span>
                        {e.name}
                        {e.optional ? " (optional)" : ""}
                      </span>
                      <small>{targetLabel(e)}</small>
                    </li>
                  ))}
                </ol>
                <p>
                  {nextTemplate.cardio.min}–{nextTemplate.cardio.max} min{" "}
                  {nextTemplate.cardio.modality.toLowerCase()}. Shorten cardio
                  or skip accessories if needed; keep rest between demanding
                  sets.
                </p>
                <p className="fit-muted">
                  RIR: the good-form reps you think you could still do. Target{" "}
                  {nextTemplate.rir}–{nextTemplate.rir + 1}; blank means
                  unknown.
                </p>
                <details>
                  <summary>Move or skip this session</summary>
                  <Field
                    label="Next planned date"
                    type="date"
                    value={profile.nextDate}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      if (!canSchedule(e.target.value, sessions)) {
                        setNotice(
                          "Leave at least one recovery day between lifting sessions.",
                        );
                        return;
                      }
                      saveProfile({ ...profile, nextDate: e.target.value });
                    }}
                  />
                  <p className="fit-muted">
                    Keep lifting days nonconsecutive. Moving a date keeps your
                    place; no overdue penalty.
                  </p>
                  <button disabled={!!active} onClick={() => start(true)}>
                    Skip this session
                  </button>
                </details>
              </Panel>
              <Safety profile={profile} />
              <Panel title="Recent sessions">
                {sessions.length === 0 ? (
                  <p className="fit-muted">
                    Your first session will appear here. No example
                    achievements.
                  </p>
                ) : (
                  <div className="fit-history">
                    {[...sessions]
                      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
                      .map((s) => (
                        <button key={s.id} onClick={() => setSelected(s.id)}>
                          <span>
                            {s.name}
                            <small>
                              {s.date} · week {s.week}
                            </small>
                          </span>
                          <span className="fit-badge">{s.status}</span>
                        </button>
                      ))}
                  </div>
                )}
              </Panel>
            </>
          )}
          {tab === "Program" && (
            <Program
              profile={profile}
              saveProfile={saveProfile}
              templates={templates}
              put={data.put}
              active={!!active}
            />
          )}
          {tab === "Progress" && (
            <Progress records={data.records} profile={profile} put={data.put} />
          )}
          {tab === "Settings" && (
            <Settings
              profile={profile}
              save={saveProfile}
              data={data}
              onSignOut={onSignOut}
            />
          )}
        </>
      )}
      <footer className="fit-footer">
        <button onClick={onLegacy}>
          <FiArrowLeft /> Previous workouts & glucose tools
        </button>
        <span>Training at your pace · {localDate()}</span>
      </footer>
    </div>
  );
}

import { Panel } from "./ui";
export default function Safety({ profile }) {
  return (
    <Panel title="Before you train" className="fit-safety">
      <p>
        Keep monitoring supplies and fast-acting carbohydrate available. Follow
        your care team’s monitoring and low-glucose plan. Pause if you feel
        unwell; do not train through suspected low glucose.
      </p>
      <details>
        <summary>Your safety plan & medication information</summary>
        <p className="fit-private-note">
          {profile.safetyPlan ||
            "No personal safety plan saved. Add your clinician-provided plan in Settings."}
        </p>
        <p>
          Gliclazide can cause low blood sugar; exercise can raise this risk,
          including after activity. Empagliflozin can cause dehydration.
          Vomiting, abdominal pain, unusual tiredness or confusion, or
          rapid/deep breathing need urgent medical assessment; a glucose reading
          cannot rule out a serious problem.
        </p>
        <p>
          For severe symptoms, unconsciousness or inability to swallow safely,
          seek local emergency help. This log does not give medication changes,
          doses or clearance to exercise.
        </p>
        <p className="fit-muted">
          Sources checked 28 September 2026. Follow your clinician’s personal
          care plan.
        </p>
        <div className="fit-actions">
          <a
            href="https://www.nhs.uk/medicines/gliclazide/"
            target="_blank"
            rel="noreferrer"
          >
            NHS: gliclazide
          </a>
          <a
            href="https://www.nhs.uk/medicines/empagliflozin/side-effects-of-empagliflozin/"
            target="_blank"
            rel="noreferrer"
          >
            NHS: empagliflozin
          </a>
        </div>
      </details>
    </Panel>
  );
}

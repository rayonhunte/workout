import { test, before, after } from "node:test";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-workout",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  await env.clearFirestore();
});
after(async () => {
  await env?.cleanup();
});
test("Account ownership, immutable record kinds, revision checks and anonymous rejection", async () => {
  const owner = env.authenticatedContext("owner").firestore(),
    other = env.authenticatedContext("other").firestore(),
    anon = env.unauthenticatedContext().firestore();
  const path = "users/owner/fitnessRecords/session-test";
  const payload = {
    schemaVersion: 1,
    kind: "session",
    revision: 1,
    data: { notes: "private" },
  };
  await assertSucceeds(setDoc(doc(owner, path), payload));
  await assertSucceeds(getDoc(doc(owner, path)));
  await assertFails(getDoc(doc(other, path)));
  await assertFails(getDoc(doc(anon, path)));
  await assertFails(setDoc(doc(other, path), { ...payload, revision: 2 }));
  await assertFails(deleteDoc(doc(other, path)));
  await assertFails(setDoc(doc(owner, path), payload));
  await assertFails(
    setDoc(doc(owner, path), { ...payload, kind: "profile", revision: 2 }),
  );
  await assertSucceeds(setDoc(doc(owner, path), { ...payload, revision: 2 }));
  await assertSucceeds(
    getDocs(collection(owner, "users/owner/fitnessRecords")),
  );
  await assertFails(getDocs(collection(other, "users/owner/fitnessRecords")));
});
test("Legacy workouts, templates and glucose preserve owner access without uid reassignment", async () => {
  const owner = env.authenticatedContext("legacy-owner").firestore(),
    other = env.authenticatedContext("legacy-other").firestore();
  for (const name of ["workouts", "workoutTemplates", "bloodSugarReadings"]) {
    const path = `${name}/compatibility-test`;
    await assertSucceeds(
      setDoc(doc(owner, path), {
        uid: "legacy-owner",
        date: "2025-09-09",
        name: "Existing record",
      }),
    );
    await assertSucceeds(
      getDocs(
        query(collection(owner, name), where("uid", "==", "legacy-owner")),
      ),
    );
    await assertFails(getDoc(doc(other, path)));
    await assertFails(setDoc(doc(owner, path), { uid: "legacy-other" }));
    await assertFails(deleteDoc(doc(other, path)));
    await assertSucceeds(deleteDoc(doc(owner, path)));
  }
});

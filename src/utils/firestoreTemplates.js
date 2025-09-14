// src/utils/firestoreTemplates.js
import { collection, query, where, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Listen to user templates
export const listenUserTemplates = (uid, callback) => {
  const q = query(collection(db, "workoutTemplates"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

// Add a template for the user. Accepts a workout or template-like object
export const addUserTemplate = async (uid, source) => {
  if (!uid || !source) return;
  const safeExercises = Array.isArray(source.exercises)
    ? source.exercises.map(ex => ({ name: ex.name || "", sets: ex.sets || 1, reps: ex.reps || "" }))
    : [];
  const payload = {
    name: source.name || "Untitled",
    exercises: safeExercises,
    uid,
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, "workoutTemplates"), payload);
};


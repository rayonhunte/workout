// src/utils/firestoreWorkouts.js
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Get all workouts for a user
export const getUserWorkouts = async (uid) => {
  const q = query(collection(db, "workouts"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  // Ensure Firestore doc ID is used as the canonical id
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
};

// Listen to workouts for a user (real-time)
export const listenUserWorkouts = (uid, callback) => {
  const q = query(collection(db, "workouts"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    // Ensure Firestore doc ID is used as the canonical id
    callback(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
  });
};

// Add a workout for a user
export const addUserWorkout = async (uid, workout) => {
  // Do not persist any client-generated `id` field to avoid conflicts
  const { id: _omitId, ...workoutData } = workout || {};
  const docRef = await addDoc(collection(db, "workouts"), { ...workoutData, uid });
  return { ...workoutData, id: docRef.id, uid };
};

// Update a workout
export const updateUserWorkout = async (id, workout) => {
  // Avoid writing an `id` field back into the document
  const { id: _omitId, ...workoutData } = workout || {};
  await updateDoc(doc(db, "workouts", id), workoutData);
};

// Delete a workout
export const deleteUserWorkout = async (id) => {
  await deleteDoc(doc(db, "workouts", id));
};

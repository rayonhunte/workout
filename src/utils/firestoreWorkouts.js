// src/utils/firestoreWorkouts.js
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Get all workouts for a user
export const getUserWorkouts = async (uid) => {
  const q = query(collection(db, "workouts"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Listen to workouts for a user (real-time)
export const listenUserWorkouts = (uid, callback) => {
  const q = query(collection(db, "workouts"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

// Add a workout for a user
export const addUserWorkout = async (uid, workout) => {
  const docRef = await addDoc(collection(db, "workouts"), { ...workout, uid });
  return { ...workout, id: docRef.id, uid };
};

// Update a workout
export const updateUserWorkout = async (id, workout) => {
  await updateDoc(doc(db, "workouts", id), workout);
};

// Delete a workout
export const deleteUserWorkout = async (id) => {
  await deleteDoc(doc(db, "workouts", id));
};

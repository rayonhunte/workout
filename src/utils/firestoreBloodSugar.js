// src/utils/firestoreBloodSugar.js
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const collectionName = "bloodSugarReadings";

// Listen for a user's blood sugar readings, newest first
export const listenBloodSugarReadings = (uid, callback) => {
  if (!uid) return () => {};
  const q = query(collection(db, collectionName), where("uid", "==", uid));
  const toMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.toDate === "function") {
      const d = value.toDate();
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };
  return onSnapshot(q, (snapshot) => {
    const readings = snapshot.docs
      .map((d) => ({
        ...d.data(),
        id: d.id,
      }))
      .sort((a, b) => toMillis(b.recordedAt) - toMillis(a.recordedAt));
    callback(readings);
  });
};

// Add a single reading (expects meter + cgm numbers)
export const addBloodSugarReading = async (uid, { meter, cgm, recordedAt }) => {
  if (!uid) return null;
  const payload = {
    uid,
    meter: Number.isFinite(Number(meter)) ? Number(meter) : null,
    cgm: Number.isFinite(Number(cgm)) ? Number(cgm) : null,
    difference:
      Number.isFinite(Number(meter)) && Number.isFinite(Number(cgm))
        ? Number(meter) - Number(cgm)
        : null,
    recordedAt: recordedAt || serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, collectionName), payload);
  return { ...payload, id: docRef.id };
};

// Remove a reading
export const deleteBloodSugarReading = async (id) => {
  if (!id) return;
  await deleteDoc(doc(db, collectionName, id));
};

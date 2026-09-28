import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import { FitnessStore } from "./store";

export function useFitness(uid) {
  const [locked, setLocked] = useState(false);
  const [acquiring, setAcquiring] = useState(true);
  const store = useMemo(() => {
    const ref = collection(db, "users", uid, "fitnessRecords");
    return new FitnessStore(uid, window.localStorage, {
      watch(callback, onError) {
        return onSnapshot(
          ref,
          (snapshot) =>
            callback(
              Object.fromEntries(snapshot.docs.map((d) => [d.id, d.data()])),
              !snapshot.metadata.fromCache,
            ),
          onError,
        );
      },
      write(id, record) {
        return runTransaction(db, async (transaction) => {
          const target = doc(ref, id);
          const current = await transaction.get(target);
          const remote = current.exists() ? current.data() : null;
          if (remote?.operationId === record.token) return remote.revision;
          if ((remote?.revision || 0) !== record.revision) {
            const error = new Error("conflict");
            error.conflict = true;
            error.remote = remote;
            throw error;
          }
          const revision = record.revision + 1;
          transaction.set(target, {
            schemaVersion: 1,
            kind: record.kind,
            data: record.data,
            revision,
            operationId: record.token,
          });
          return revision;
        });
      },
    });
  }, [uid]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    let cleanup = () => {},
      unlock = () => {},
      disposed = false;
    const controller = new AbortController();
    const waiting = setTimeout(() => {
      setLocked(true);
      setAcquiring(false);
    }, 1000);
    const online = () => store.setOnline(navigator.onLine);
    const begin = () => {
      if (disposed) return;
      clearTimeout(waiting);
      setLocked(false);
      store.online = navigator.onLine;
      cleanup = store.start();
      window.addEventListener("online", online);
      window.addEventListener("offline", online);
      setAcquiring(false);
    };
    if (navigator.locks)
      navigator.locks
        .request(
          `fitness-writer:${uid}`,
          { signal: controller.signal },
          async () => {
            if (disposed) return;
            begin();
            await new Promise((resolve) => {
              unlock = resolve;
            });
          },
        )
        .catch((error) => {
          if (error.name !== "AbortError") {
            store.error = "Could not protect device drafts. Reload to retry.";
            store.publish();
          }
        });
    else begin();
    const beforeUnload = (e) => {
      if (store.storageError && store.getSnapshot().pending) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      disposed = true;
      clearTimeout(waiting);
      controller.abort();
      cleanup();
      unlock();
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [store, uid]);
  const records = Object.entries(snapshot.records).map(([id, r]) => ({
    ...r.data,
    id,
    kind: r.kind,
  }));
  return {
    ...snapshot,
    store,
    records,
    locked,
    acquiring,
    put: (id, kind, data) => store.put(id, kind, data),
  };
}

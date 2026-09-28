// Durable per-account outbox. Transactions reject stale edits from other devices.
export class FitnessStore {
  constructor(uid, storage, transport) {
    this.key = `fitness-v1:${uid}`;
    this.storage = storage;
    this.transport = transport;
    this.listeners = new Set();
    this.running = new Set();
    this.records = {};
    this.error = "";
    this.conflicts = {};
    this.online = true;
    this.ready = false;
    this.closed = false;
    this.loadCache();
    this.publish();
  }
  loadCache() {
    try {
      const raw = this.storage.getItem(this.key) || "{}";
      const records = JSON.parse(raw);
      if (
        !records ||
        Array.isArray(records) ||
        typeof records !== "object" ||
        Object.values(records).some(
          (r) => !r || !r.kind || !r.data || typeof r.data !== "object",
        )
      )
        throw new Error("Invalid cache");
      this.records = records;
      this.corruptCache = null;
    } catch {
      try {
        this.corruptCache = this.storage.getItem(this.key);
      } catch {
        this.corruptCache = "Storage unavailable";
      }
      this.storageError = true;
      this.error =
        "Device drafts could not be read. Export a recovery backup before clearing this browser’s cache.";
    }
  }
  getSnapshot = () => this.snapshot;
  subscribe = (callback) => {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  };
  publish() {
    this.snapshot = {
      records: this.records,
      error: this.error,
      conflicts: this.conflicts,
      online: this.online,
      ready: this.ready,
      pending: Object.values(this.records).filter((r) => r.dirty).length,
    };
    this.listeners.forEach((fn) => fn());
  }
  persist() {
    if (this.discardCache) return;
    if (this.corruptCache) {
      this.publish();
      return;
    }
    try {
      this.storage.setItem(this.key, JSON.stringify(this.records));
      this.storageError = false;
    } catch {
      this.storageError = true;
      this.error =
        "Device storage failed. Changes remain in memory only until cloud save succeeds. Export a backup before closing.";
    }
    this.publish();
  }
  start() {
    this.closed = false;
    this.loadCache();
    this.listen();
    this.flush();
    return () => {
      this.closed = true;
      this.unsubscribe?.();
    };
  }
  listen() {
    this.unsubscribe?.();
    this.watchFailed = false;
    this.unsubscribe = this.transport.watch(
      (remote, authoritative = true) => {
        if (this.closed) return;
        const records = { ...this.records };
        if (authoritative)
          for (const id of Object.keys(records))
            if (!records[id].dirty && !remote[id]) delete records[id];
        for (const [id, record] of Object.entries(remote))
          if (!records[id]?.dirty) records[id] = { ...record, dirty: false };
        this.records = records;
        this.ready = true;
        this.persist();
      },
      () => {
        this.watchFailed = true;
        this.ready = true;
        this.error =
          "Cloud data could not be loaded. Device drafts are available. Check access rules or connectivity and retry.";
        this.publish();
      },
    );
  }
  put(id, kind, data) {
    const previous = this.records[id];
    this.records = {
      ...this.records,
      [id]: {
        kind,
        data: structuredClone(data),
        revision: previous?.revision || 0,
        dirty: true,
        token: crypto.randomUUID(),
        schemaVersion: 1,
      },
    };
    this.persist();
    this.flush();
  }
  setOnline(online) {
    this.online = online;
    this.publish();
    if (online) this.retry();
  }
  retry() {
    if (!this.corruptCache) this.error = "";
    if (this.watchFailed && !this.closed) this.listen();
    this.persist();
    this.flush();
  }
  async flush() {
    if (!this.online || this.closed) return;
    for (const id of Object.keys(this.records)) {
      if (
        !this.records[id].dirty ||
        this.running.has(id) ||
        Object.hasOwn(this.conflicts, id)
      )
        continue;
      this.running.add(id);
      try {
        while (this.records[id]?.dirty && this.online && !this.closed) {
          const sent = this.records[id];
          const revision = await this.transport.write(id, sent);
          const latest = this.records[id];
          this.records = {
            ...this.records,
            [id]: { ...latest, revision, dirty: latest.token !== sent.token },
          };
          this.persist();
        }
      } catch (error) {
        if (error.conflict)
          this.conflicts = { ...this.conflicts, [id]: error.remote };
        else
          this.error =
            "Cloud save failed. Your device draft is retained; reconnect or check access, then retry.";
        this.publish();
      } finally {
        this.running.delete(id);
      }
    }
  }
  clearDevice() {
    this.closed = true;
    this.discardCache = true;
    this.unsubscribe?.();
    this.storage.removeItem(this.key);
  }
  resolve(id, keepLocal) {
    const remote = this.conflicts[id];
    this.records = {
      ...this.records,
      [id]: keepLocal
        ? { ...this.records[id], revision: remote?.revision || 0, dirty: true }
        : { ...remote, dirty: false },
    };
    if (!keepLocal && !remote) {
      const records = { ...this.records };
      delete records[id];
      this.records = records;
    }
    const conflicts = { ...this.conflicts };
    delete conflicts[id];
    this.conflicts = conflicts;
    this.persist();
    this.flush();
  }
}

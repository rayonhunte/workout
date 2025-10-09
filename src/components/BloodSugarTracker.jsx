import { useMemo, useState } from "react";
import { FiDroplet, FiPlus, FiTrash2 } from "react-icons/fi";

const parseNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return numeric.toFixed(digits);
};

const formatTimestamp = (value) => {
  if (!value) return "Logged";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Logged";
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const BloodSugarTracker = ({
  readings,
  onAddReading,
  onDeleteReading,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [meter, setMeter] = useState("");
  const [cgm, setCgm] = useState("");
  const [error, setError] = useState("");

  const cleanReadings = useMemo(() => {
    return (Array.isArray(readings) ? readings : []).map((reading, index) => {
      const meterValue = parseNumber(reading?.meter);
      const cgmValue = parseNumber(reading?.cgm);
      const diff =
        reading?.difference !== undefined && reading?.difference !== null
          ? Number(reading.difference)
          : meterValue !== null && cgmValue !== null
          ? meterValue - cgmValue
          : null;
      return {
        ...reading,
        meter: meterValue,
        cgm: cgmValue,
        difference: diff,
        recordedAt: reading?.recordedAt || reading?.createdAt || null,
        _key: reading?.id || `reading-${index}`,
      };
    });
  }, [readings]);

  const stats = useMemo(() => {
    if (!cleanReadings.length) {
      return {
        count: 0,
        avgMeter: null,
        avgCgm: null,
        avgDiff: null,
        avgDiffAbs: null,
        latest: null,
      };
    }

    const valid = cleanReadings.filter(
      (reading) => reading.meter !== null && reading.cgm !== null
    );

    const totals = valid.reduce(
      (acc, reading) => {
        const diff = reading.difference ?? reading.meter - reading.cgm;
        return {
          meter: acc.meter + (reading.meter ?? 0),
          cgm: acc.cgm + (reading.cgm ?? 0),
          diff: acc.diff + (diff ?? 0),
          absDiff: acc.absDiff + Math.abs(diff ?? 0),
        };
      },
      { meter: 0, cgm: 0, diff: 0, absDiff: 0 }
    );

    const divisor = valid.length || 1;

    return {
      count: valid.length,
      avgMeter: valid.length ? totals.meter / divisor : null,
      avgCgm: valid.length ? totals.cgm / divisor : null,
      avgDiff: valid.length ? totals.diff / divisor : null,
      avgDiffAbs: valid.length ? totals.absDiff / divisor : null,
      latest: cleanReadings[0],
    };
  }, [cleanReadings]);

  const differencePreview = useMemo(() => {
    const meterValue = parseNumber(meter);
    const cgmValue = parseNumber(cgm);
    if (meterValue === null || cgmValue === null) return null;
    return meterValue - cgmValue;
  }, [meter, cgm]);

  const differencePreviewTone =
    differencePreview === null
      ? "text-gray-500 dark:text-gray-400"
      : differencePreview >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  const averageDiffTone =
    stats.avgDiff !== null
      ? stats.avgDiff >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400"
      : "text-gray-600 dark:text-gray-400";

  const latestDiff =
    stats.latest && stats.latest.difference !== null
      ? stats.latest.difference
      : stats.latest && stats.latest.meter !== null && stats.latest.cgm !== null
      ? stats.latest.meter - stats.latest.cgm
      : null;

  const latestDiffTone =
    latestDiff !== null
      ? latestDiff >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400"
      : "text-gray-600 dark:text-gray-400";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const meterValue = parseNumber(meter);
    const cgmValue = parseNumber(cgm);
    if (meterValue === null || cgmValue === null) {
      setError("Enter both meter and CGM readings.");
      return;
    }
    try {
      setError("");
      await onAddReading({ meter: meterValue, cgm: cgmValue });
      setMeter("");
      setCgm("");
      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to add blood sugar reading", err);
      setError("Failed to add reading. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDeleteReading(id);
    } catch (err) {
      console.error("Failed to delete blood sugar reading", err);
    }
  };

  return (
    <section className="card-base p-6 hover:shadow-strong hover:-translate-y-2 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-xl shadow-lg shadow-rose-200/50">
              <FiDroplet size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Meter vs CGM Tracker
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Log paired readings to compare your devices over time.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsFormOpen((prev) => !prev);
            setError("");
          }}
          className={`flex items-center justify-center rounded-full transition-all duration-300 focus-ring ${
            isFormOpen
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-rose-100 text-rose-600 hover:bg-rose-200"
          } w-12 h-12 shadow-lg hover:shadow-xl active:scale-95`}
          aria-expanded={isFormOpen}
          aria-label={isFormOpen ? "Close blood sugar form" : "Add blood sugar reading"}
        >
          <FiPlus size={20} />
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-900/20 p-4 mb-6 animate-fade-in"
        >
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Meter (mg/dL)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={meter}
                  onChange={(e) => setMeter(e.target.value)}
                  placeholder="e.g. 110"
                  className="input-base w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  CGM (mg/dL)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={cgm}
                  onChange={(e) => setCgm(e.target.value)}
                  placeholder="e.g. 104"
                  className="input-base w-full px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-white/80 dark:bg-gray-900/60 px-4 py-3">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                Difference
              </label>
              <div
                className={`text-sm font-semibold px-4 py-3 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-white/80 dark:bg-gray-900/60 ${differencePreviewTone}`}
              >
                {differencePreview !== null
                  ? `${formatNumber(differencePreview, 1)} mg/dL`
                  : "—"}
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Positive numbers mean your meter is higher than your CGM.
              </p>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-100 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 focus-ring"
            >
              Log Reading
            </button>
          </div>
        </form>
      )}

      {cleanReadings.length > 0 ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-white/80 dark:bg-gray-900/60 px-4 py-3">
              <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                Average Meter
              </span>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-300 mt-1">
                {stats.avgMeter !== null
                  ? `${formatNumber(stats.avgMeter, 1)} mg/dL`
                  : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-white/80 dark:bg-gray-900/60 px-4 py-3">
              <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                Average CGM
              </span>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-300 mt-1">
                {stats.avgCgm !== null
                  ? `${formatNumber(stats.avgCgm, 1)} mg/dL`
                  : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-white/80 dark:bg-gray-900/60 px-4 py-3">
              <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                Average Difference
              </span>
              <div className={`text-lg font-bold mt-1 ${averageDiffTone}`}>
                {stats.avgDiff !== null
                  ? `${formatNumber(stats.avgDiff, 1)} mg/dL`
                  : "—"}
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                |Δ| avg:{" "}
                {stats.avgDiffAbs !== null
                  ? `${formatNumber(stats.avgDiffAbs, 1)} mg/dL`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Latest Difference
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {stats.latest?.recordedAt
                    ? formatTimestamp(stats.latest.recordedAt)
                    : "Most recent entry"}
                </p>
              </div>
              <div className={`text-base font-semibold ${latestDiffTone}`}>
                {latestDiff !== null
                  ? `${formatNumber(latestDiff, 1)} mg/dL`
                  : "—"}
              </div>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cleanReadings.map((reading) => {
                const diff = reading.difference;
                const diffClass =
                  diff !== null
                    ? diff >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                    : "text-gray-600 dark:text-gray-400";
                return (
                  <div
                    key={reading._key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-rose-100/70 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-900/20 px-3 py-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {formatTimestamp(reading.recordedAt)}
                      </div>
                      <div className={`text-[11px] font-semibold ${diffClass}`}>
                        {diff !== null
                          ? `${formatNumber(diff, 1)} mg/dL difference`
                          : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                        Meter: {formatNumber(reading.meter, 1)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                        CGM: {formatNumber(reading.cgm, 1)}
                      </span>
                      {reading.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(reading.id)}
                          className="p-2 rounded-full text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all duration-200 focus-ring"
                          aria-label="Delete reading"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 dark:bg-rose-900/20 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
          No paired readings yet. Use the red plus button to log your first meter and CGM values.
        </div>
      )}
    </section>
  );
};

export default BloodSugarTracker;

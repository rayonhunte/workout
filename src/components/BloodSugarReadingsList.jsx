import { useMemo } from "react";
import { FiDroplet } from "react-icons/fi";

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

const BloodSugarReadingsList = ({ readings = [], onDelete }) => {
  const { preparedReadings, diffSummary } = useMemo(() => {
    const safeReadings = (Array.isArray(readings) ? readings : []).map((reading, index) => {
      const meter =
        reading?.meter !== undefined && reading?.meter !== null
          ? Number(reading.meter)
          : null;
      const cgm =
        reading?.cgm !== undefined && reading?.cgm !== null
          ? Number(reading.cgm)
          : null;
      const difference =
        reading?.difference !== undefined && reading?.difference !== null
          ? Number(reading.difference)
          : meter !== null && cgm !== null
          ? meter - cgm
          : null;
      return {
        ...reading,
        id: reading?.id || `reading-${index}`,
        meter: Number.isFinite(meter) ? meter : null,
        cgm: Number.isFinite(cgm) ? cgm : null,
        difference: Number.isFinite(difference) ? difference : null,
        recordedAt: reading?.recordedAt || reading?.createdAt || null,
      };
    });

    const statsSource = safeReadings.filter(
      (reading) => reading.meter !== null && reading.cgm !== null
    );

    if (!statsSource.length) {
      return {
        preparedReadings: safeReadings,
        diffSummary: null,
      };
    }

    const totals = statsSource.reduce(
      (acc, reading) => {
        const diff = reading.difference ?? reading.meter - reading.cgm;
        return {
          count: acc.count + 1,
          meter: acc.meter + (reading.meter ?? 0),
          cgm: acc.cgm + (reading.cgm ?? 0),
          diff: acc.diff + (diff ?? 0),
          absDiff: acc.absDiff + Math.abs(diff ?? 0),
          latest: acc.latest?.recordedAt &&
            new Date(acc.latest.recordedAt) > new Date(reading.recordedAt || 0)
            ? acc.latest
            : reading,
        };
      },
      { count: 0, meter: 0, cgm: 0, diff: 0, absDiff: 0, latest: null }
    );

    return {
      preparedReadings: safeReadings,
      diffSummary: {
        count: totals.count,
        avgMeter: totals.meter / totals.count,
        avgCgm: totals.cgm / totals.count,
        avgDiff: totals.diff / totals.count,
        avgDiffAbs: totals.absDiff / totals.count,
        latest: totals.latest,
      },
    };
  }, [readings]);

  return (
    <section className="card-base p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl shadow-lg shadow-rose-200/60">
            <FiDroplet size={16} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Logged Readings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track the difference between your meter and CGM.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {preparedReadings.length} total
        </span>
      </div>

      {diffSummary ? (
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
              Avg Meter
            </span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-300 mt-1">
              {formatNumber(diffSummary.avgMeter, 1)} mg/dL
            </div>
          </div>
          <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
              Avg CGM
            </span>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-300 mt-1">
              {formatNumber(diffSummary.avgCgm, 1)} mg/dL
            </div>
          </div>
          <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
              Avg Difference
            </span>
            <div
              className={`text-lg font-bold mt-1 ${
                diffSummary.avgDiff >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatNumber(diffSummary.avgDiff, 1)} mg/dL
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              |Δ| avg: {formatNumber(diffSummary.avgDiffAbs, 1)} mg/dL
            </p>
          </div>
          <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
              Latest Reading
            </span>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">
              {diffSummary.latest
                ? formatTimestamp(diffSummary.latest.recordedAt)
                : "Logged"}
            </div>
          </div>
        </div>
      ) : null}

      {preparedReadings.length ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {preparedReadings.map((reading) => {
            const diff = reading.difference;
            const diffTone =
              diff !== null
                ? diff >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
                : "text-gray-600 dark:text-gray-400";
            return (
              <div
                key={reading.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-rose-100/60 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-900/20 px-3 py-3"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {formatTimestamp(reading.recordedAt)}
                  </div>
                  <div className={`text-[11px] font-semibold ${diffTone}`}>
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
                  {reading.id && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(reading.id)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all duration-200 focus-ring"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/30 dark:bg-rose-900/20 p-6 text-center text-sm text-gray-600 dark:text-gray-400">
          No readings logged yet.
        </div>
      )}
    </section>
  );
};

export default BloodSugarReadingsList;

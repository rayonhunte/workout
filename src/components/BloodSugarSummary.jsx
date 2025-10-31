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

const BloodSugarSummary = ({ readings = [] }) => {
  const { count, avgMeter, avgCgm, avgDiff, avgDiffAbs, latest } = useMemo(() => {
    const safe = (Array.isArray(readings) ? readings : []).map((r) => ({
      meter: r?.meter != null ? Number(r.meter) : null,
      cgm: r?.cgm != null ? Number(r.cgm) : null,
      difference:
        r?.difference != null
          ? Number(r.difference)
          : r?.meter != null && r?.cgm != null
          ? Number(r.meter) - Number(r.cgm)
          : null,
      recordedAt: r?.recordedAt || r?.createdAt || null,
    }));

    const statsSource = safe.filter((r) => r.meter !== null && r.cgm !== null);
    if (!statsSource.length) {
      return { count: safe.length, avgMeter: null, avgCgm: null, avgDiff: null, avgDiffAbs: null, latest: null };
    }

    const totals = statsSource.reduce(
      (acc, r) => {
        const meterValue = r.meter ?? 0;
        const cgmValue = r.cgm ?? 0;
        const meterCgmDiff = r.meter - r.cgm;
        const diffValue = r.difference ?? meterCgmDiff ?? 0;
        return {
          count: acc.count + 1,
          meter: acc.meter + meterValue,
          cgm: acc.cgm + cgmValue,
          diff: acc.diff + diffValue,
          absDiff: acc.absDiff + Math.abs(diffValue),
          latest:
            acc.latest?.recordedAt && new Date(acc.latest.recordedAt) > new Date(r.recordedAt || 0)
              ? acc.latest
              : r,
        };
      },
      { count: 0, meter: 0, cgm: 0, diff: 0, absDiff: 0, latest: null }
    );

    return {
      count: safe.length,
      avgMeter: totals.count ? totals.meter / totals.count : null,
      avgCgm: totals.count ? totals.cgm / totals.count : null,
      avgDiff: totals.count ? totals.diff / totals.count : null,
      avgDiffAbs: totals.count ? totals.absDiff / totals.count : null,
      latest: totals.latest,
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Logged Readings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track the difference between your meter and CGM.</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{count} total</span>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Avg Meter</span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-300 mt-1">{formatNumber(avgMeter, 1)} mg/dL</div>
        </div>
        <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Avg CGM</span>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-300 mt-1">{formatNumber(avgCgm, 1)} mg/dL</div>
        </div>
        <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Avg Difference</span>
          <div className={`text-lg font-bold mt-1 ${avgDiff != null && avgDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatNumber(avgDiff, 1)} mg/dL
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">|Δ| avg: {formatNumber(avgDiffAbs, 1)} mg/dL</p>
        </div>
        <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-white/70 dark:bg-gray-900/60 p-3">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Latest Reading</span>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">
            {latest ? formatTimestamp(latest.recordedAt) : 'Logged'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BloodSugarSummary;


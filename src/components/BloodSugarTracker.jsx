import { useMemo, useState } from "react";
import { FiDroplet, FiPlus } from "react-icons/fi";

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

const BloodSugarTracker = ({ onAddReading, hasReadings }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [meter, setMeter] = useState("");
  const [cgm, setCgm] = useState("");
  const [error, setError] = useState("");

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

      {hasReadings ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-white/80 dark:bg-gray-900/60 px-4 py-3">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Tip
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Use the red plus button whenever you want to compare your meter and CGM.
            </p>
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

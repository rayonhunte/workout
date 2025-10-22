import React, { useMemo, useState } from 'react';
import { FiDroplet } from 'react-icons/fi';
import BloodSugarTracker from './BloodSugarTracker';
import BloodSugarReadingsList from './BloodSugarReadingsList';
import BloodSugarSummary from './BloodSugarSummary';

const Glucose = ({
  stats,
  readings,
  onAddReading,
  onDeleteReading,
}) => {
  const todayYMD = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const [selectedDate, setSelectedDate] = useState(todayYMD());

  const filteredReadings = useMemo(() => {
    if (!Array.isArray(readings)) return [];
    const dayStr = new Date(`${selectedDate}T00:00:00`).toDateString();
    return readings.filter((r) => {
      const raw = r?.recordedAt || r?.createdAt;
      if (!raw) return false;
      const dt = new Date(raw);
      if (Number.isNaN(dt.getTime())) return false;
      return dt.toDateString() === dayStr;
    });
  }, [readings, selectedDate]);

  return (
    <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6">
      {/* Tracker Card */}
      <div className="mt-1">
        <BloodSugarTracker onAddReading={onAddReading} hasReadings={(readings || []).length > 0} />
      </div>

      {/* Snapshot Card */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
        <div className="card-interactive col-span-3 bg-gradient-to-br from-rose-50 to-rose-100 p-4 border border-rose-200/50 hover:shadow-glow-purple animate-slide-up animate-delay-200 group w-full">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-rose-500 text-white rounded-lg shadow-md">
              <FiDroplet size={18} />
            </div>
            <div>
              <h4 className="text-base font-semibold text-rose-700">Blood Sugar Snapshot</h4>
              <p className="text-xs text-rose-600">Averages across workouts and CGM logs.</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-rose-700">
            <div className="rounded-lg border border-rose-200 bg-white/80 px-3 py-2 flex justify-between">
              <span className="font-semibold text-rose-600">Before / After</span>
              <span>B: {stats?.avgBefore ?? '—'} · A: {stats?.avgAfter ?? '—'} mg/dL</span>
            </div>
            <div className="rounded-lg border border-rose-200 bg-white/80 px-3 py-2 flex justify-between">
              <span className="font-semibold text-rose-600">Meter / CGM</span>
              <span>M: {stats?.avgMeter ?? '—'} · C: {stats?.avgCGM ?? '—'} mg/dL</span>
            </div>
            <div className="rounded-lg border border-rose-200 bg-white/80 px-3 py-2 flex justify-between">
              <span className="font-semibold text-rose-600">Difference</span>
              <span>
                Δ: {stats?.avgMeterCgmDiff?.avg ?? '—'} · |Δ|: {stats?.avgMeterCgmDiff?.abs ?? '—'} mg/dL
              </span>
            </div>
            <div className="rounded-lg border border-rose-200 bg-white/80 px-3 py-2 flex justify-between">
              <span className="font-semibold text-rose-600">Entries</span>
              <span>{(readings || []).length} readings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter + Summary */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mr-2">Date</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-base px-3 py-1.5 text-xs font-semibold w-auto"
              aria-label="Filter glucose readings by date"
            />
            <button
              type="button"
              onClick={() => setSelectedDate(todayYMD())}
              className="px-2 py-1.5 rounded-full text-xs font-semibold border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus-ring"
              title="Set to today"
            >
              Today
            </button>
          </div>
        </div>
        <BloodSugarSummary readings={filteredReadings} />
      </div>

      {/* Readings List */}
      <div className="mt-4">
        <BloodSugarReadingsList readings={filteredReadings} onDelete={onDeleteReading} />
      </div>
    </div>
  );
};

export default Glucose;

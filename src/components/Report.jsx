import React, { useMemo } from 'react';
import { FiBarChart2, FiCalendar, FiCheckCircle, FiList, FiTrendingUp, FiArrowLeft } from 'react-icons/fi';

const toLocalDate = (ymd) => new Date(`${ymd}T00:00:00`);

const withinLastNDays = (ymd, n) => {
  if (!ymd) return false;
  const d = toLocalDate(ymd).getTime();
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));
  const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const dayMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= startMs && d <= dayMs;
};

const inCurrentMonth = (ymd) => {
  if (!ymd) return false;
  const d = toLocalDate(ymd);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

const summarize = (workouts, filterFn) => {
  const list = (workouts || []).filter((w) => w?.date && filterFn(w.date));
  const total = list.length;
  const completed = list.filter((w) => !!w.completed).length;
  const incomplete = total - completed;
  const daysActive = new Set(list.map((w) => w.date)).size;
  const typeCounts = {};
  for (const w of list) {
    const type = (w?.name || 'Untitled').trim();
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  const types = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
  return { total, completed, incomplete, daysActive, types, list };
};

const Stat = ({ label, value, color = 'text-gray-700', bg = 'bg-gray-100', icon }) => (
  <div className={`card-interactive ${bg} p-3 sm:p-4 text-center border border-white/40 hover:shadow-sm`}> 
    <div className={`flex items-center justify-center ${color} mb-1 sm:mb-2`}>{icon}</div>
    <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
    <div className={`text-2xs sm:text-xs ${color.replace('text-', 'text-')}`}>{label}</div>
  </div>
);

const TypesList = ({ items }) => {
  if (!items?.length) return (
    <div className="text-sm text-gray-500">No workouts yet.</div>
  );
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.map(({ type, count }) => (
        <div key={type} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{type}</div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded">
              <div
                className="h-2 rounded bg-blue-500"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </div>
          <div className="w-10 text-right text-sm text-gray-600 dark:text-gray-300">{count}</div>
        </div>
      ))}
    </div>
  );
};

const Section = ({ title, summary }) => {
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-3">
        <FiBarChart2 className="text-blue-600" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
        <Stat label="Total" value={summary.total} color="text-blue-700" bg="bg-blue-50" icon={<FiTrendingUp size={16} />} />
        <Stat label="Done" value={summary.completed} color="text-green-700" bg="bg-green-50" icon={<FiCheckCircle size={16} />} />
        <Stat label="Open" value={summary.incomplete} color="text-orange-700" bg="bg-orange-50" icon={<FiList size={16} />} />
        <Stat label="Days" value={summary.daysActive} color="text-purple-700" bg="bg-purple-50" icon={<FiCalendar size={16} />} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">By Workout Name</h4>
        <TypesList items={summary.types} />
      </div>
    </div>
  );
};

const Report = ({ workouts, onBack }) => {
  const weekly = useMemo(() => summarize(workouts, (d) => withinLastNDays(d, 7)), [workouts]);
  const monthly = useMemo(() => summarize(workouts, inCurrentMonth), [workouts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 animate-fade-in">
      <div className="glass shadow-soft border-b border-white/20">
        <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6 flex items-center">
          <button
            onClick={onBack}
            aria-label="Back"
            title="Back"
            className="mr-3 p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 focus-ring"
          >
            <FiArrowLeft size={20} className="text-gray-700 dark:text-gray-100" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <FiBarChart2 />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text text-shadow-sm">Workout Report</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">Summary for this week and month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6 space-y-4">
        <Section title="This Week (last 7 days)" summary={weekly} />
        <Section title="This Month (calendar)" summary={monthly} />
      </div>
    </div>
  );
};

export default Report;

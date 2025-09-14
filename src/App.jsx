import React, { useState, useEffect } from 'react';
import { FiPlus, FiActivity, FiTrendingUp, FiDroplet, FiHelpCircle } from 'react-icons/fi';
import WorkoutCard from './components/WorkoutCard';
import WorkoutDetails from './components/WorkoutDetails';
import AddWorkoutModal from './components/AddWorkoutModal';
import Help from './components/Help';
import ThemeToggle from './components/ThemeToggle';
import GoogleSignInButton from './components/GoogleSignInButton';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { listenUserWorkouts, addUserWorkout, updateUserWorkout, deleteUserWorkout } from './utils/firestoreWorkouts';
import { addUserTemplate } from './utils/firestoreTemplates';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'details' | 'help'
  const [filter, setFilter] = useState('all'); // all | today | completed
  const [filterDate, setFilterDate] = useState(''); // optional date filter (YYYY-MM-DD)
  const [user, setUser] = useState(null);

  // Replace localStorage logic with Firestore sync
  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      return;
    }
    // Listen to Firestore workouts for this user
    const unsubscribe = listenUserWorkouts(user.uid, (workouts) => {
      setWorkouts(workouts);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Hide scrollbar when modal is open (for mobile experience)
  useEffect(() => {
    if (showAddModal) {
      document.body.classList.add('hide-scrollbar');
    } else {
      document.body.classList.remove('hide-scrollbar');
    }
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('hide-scrollbar');
    };
  }, [showAddModal]);

  const handleSelectWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentView('details');
    // Reflect navigation in URL for browser back/forward gestures
    try {
      window.location.hash = `workout/${encodeURIComponent(workout.id)}`;
    } catch (_) {}
  };

  const handleOpenHelp = () => {
    setCurrentView('help');
    try {
      window.location.hash = 'help';
    } catch (_) {}
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    setCurrentView('list');
    // Prefer using browser back to preserve history UX
    try {
      if ((window.location.hash || '').startsWith('#workout/')) {
        window.history.back();
      } else if (window.location.hash) {
        window.location.hash = '';
      }
    } catch (_) {}
  };

  // Add workout to Firestore
  const handleAddWorkout = async (newWorkout) => {
    if (!user) return;
    await addUserWorkout(user.uid, newWorkout);
    // Also store as a reusable template for this user
    try {
      await addUserTemplate(user.uid, newWorkout);
    } catch (e) {
      console.warn('Failed to save template:', e);
    }
  };

  // Update workout in Firestore
  const handleUpdateWorkout = async (updatedWorkout) => {
    if (!user) return;
    await updateUserWorkout(updatedWorkout.id, updatedWorkout);
  };

  // Toggle complete in Firestore
  const handleToggleComplete = async (workoutId) => {
    if (!user) return;
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;
    await updateUserWorkout(workoutId, { ...workout, completed: !workout.completed });
  };

  // Delete workout from Firestore
  const handleDeleteWorkout = async (workoutId) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      try {
        await deleteUserWorkout(workoutId);
        
        // Manually update local state to ensure immediate UI update
        setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== workoutId));
        
        // If we're currently viewing the deleted workout, go back to list
        if (selectedWorkout && selectedWorkout.id === workoutId) {
          handleBackToList();
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const stats = {
    total: workouts.length,
    completed: workouts.filter(w => w.completed).length,
    today: workouts.filter(w => {
      const today = new Date();
      const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString();
      // Treat stored YYYY-MM-DD as local date by appending T00:00:00
      const workoutDate = new Date(`${w.date}T00:00:00`).toDateString();
      return todayStr === workoutDate;
    }).length,
    // Average blood sugar report (ignores null/empty values)
    avgBefore: (() => {
      const values = workouts.map(w => w?.bloodSugar?.before).filter(v => v !== null && v !== undefined && !Number.isNaN(v));
      if (!values.length) return null;
      const sum = values.reduce((a, b) => a + Number(b), 0);
      return Math.round(sum / values.length);
    })(),
    avgAfter: (() => {
      const values = workouts.map(w => w?.bloodSugar?.after).filter(v => v !== null && v !== undefined && !Number.isNaN(v));
      if (!values.length) return null;
      const sum = values.reduce((a, b) => a + Number(b), 0);
      return Math.round(sum / values.length);
    })(),
  };

  const filteredWorkouts = workouts.filter((w) => {
    const wDateStr = new Date(`${w.date}T00:00:00`).toDateString();
    const selectedDateMatch = filterDate
      ? wDateStr === new Date(`${filterDate}T00:00:00`).toDateString()
      : true;

    if (filter === 'today') {
      const today = new Date();
      const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString();
      return wDateStr === todayStr;
    }
    if (filter === 'completed') {
      return w.completed && selectedDateMatch;
    }
    // 'all'
    return selectedDateMatch;
  });

  // Listen to hash changes to support browser back/forward
  useEffect(() => {
    const applyHashRoute = () => {
      const hash = (window.location.hash || '').replace(/^#/, '');
      if (hash === 'help') {
        setCurrentView('help');
        return;
      }
      if (hash.startsWith('workout/')) {
        const id = decodeURIComponent(hash.split('/')[1] || '');
        const w = workouts.find(x => x.id === id);
        if (w) {
          setSelectedWorkout(w);
          setCurrentView('details');
        } else {
          // If workout list not yet loaded, keep view as list; listener will set when available
        }
      } else {
        setSelectedWorkout(null);
        setCurrentView('list');
      }
    };
    applyHashRoute();
    window.addEventListener('hashchange', applyHashRoute);
    return () => window.removeEventListener('hashchange', applyHashRoute);
  }, [workouts]);

  if (currentView === 'details' && selectedWorkout) {
    return (
      <WorkoutDetails
        workout={selectedWorkout}
        onBack={handleBackToList}
        onUpdateWorkout={handleUpdateWorkout}
        onDelete={handleDeleteWorkout}
      />
    );
  }

  if (currentView === 'help') {
    return <Help onBack={handleBackToList} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900">
        <img src="/bloodlogo.png" alt="Site logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg mb-4" />
        <h1 className="text-3xl font-bold mb-6 gradient-text text-shadow-sm">Workout Tracker</h1>
        <GoogleSignInButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 animate-fade-in">
      {/* Enhanced Header with improved animations */}
      <div className="glass shadow-soft border-b border-white/20 animate-slide-down">
        <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="animate-slide-up flex-1 pr-3">
              <div className="flex items-center gap-3">
                <img src="/bloodlogo.png" alt="Site logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-md shadow-sm" />
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text text-shadow-sm animate-float">
                  Workout Tracker
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 smooth-colors">Track your fitness journey</p>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
              <button
                onClick={() => setShowAddModal(true)}
                aria-label="Add workout"
                title="Add workout"
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-glow-blue focus-ring animate-bounce-gentle"
              >
                <FiPlus size={24} className="transition-transform duration-200 group-hover:rotate-90" />
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              {user && (
                <button
                  onClick={() => signOut(auth)}
                  className="ml-3 px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  Sign Out
                </button>
              )}
              <button
                onClick={handleOpenHelp}
                aria-label="Help"
                title="Help"
                className="ml-3 p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-105 focus-ring"
              >
                <FiHelpCircle size={20} />
              </button>
            </div>
          </div>

          {/* Enhanced Stats with staggered animations (Row 1 of 3 items) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="card-interactive bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 text-center border border-blue-200/50 hover:shadow-glow-blue animate-slide-up animate-delay-100 group">
              <div className="flex items-center justify-center text-blue-500 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <FiActivity size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-700 transition-all duration-300 group-hover:scale-105">{stats.total}</div>
              <div className="text-2xs sm:text-xs text-blue-600 font-medium">Total Workouts</div>
            </div>
            <div className="card-interactive bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 text-center border border-green-200/50 hover:shadow-glow-green animate-slide-up animate-delay-200 group">
              <div className="flex items-center justify-center text-green-500 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-green-500 text-white rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <FiTrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-700 transition-all duration-300 group-hover:scale-105">{stats.completed}</div>
              <div className="text-2xs sm:text-xs text-green-600 font-medium">Completed</div>
            </div>
            <div className="card-interactive bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 text-center border border-orange-200/50 hover:shadow-medium animate-slide-up animate-delay-300 group">
              <div className="flex items-center justify-center text-orange-500 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-orange-500 text-white rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <FiActivity size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-orange-700 transition-all duration-300 group-hover:scale-105">{stats.today}</div>
              <div className="text-2xs sm:text-xs text-orange-600 font-medium">Today's Plan</div>
            </div>
          </div>

          {/* Stats Row 2 (3 items max) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
            {/* Blood Sugar Report (full width on all sizes) */}
            <div className="card-interactive col-span-3 bg-gradient-to-br from-rose-50 to-rose-100 p-2 sm:p-3 border border-rose-200/50 hover:shadow-glow-purple animate-slide-up animate-delay-200 group w-full">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center text-rose-600 font-semibold text-[11px] sm:text-xs shrink-0">
                  <div className="mr-2 p-1 sm:p-1.5 bg-rose-500 text-white rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    <FiDroplet size={14} className="sm:w-[16px] sm:h-[16px]" />
                  </div>
                  <span className="whitespace-nowrap">Blood Sugar</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-rose-700 leading-tight truncate">
                  {(() => {
                    const hasAny = stats.avgBefore !== null || stats.avgAfter !== null;
                    const before = stats.avgBefore !== null ? `B: ${stats.avgBefore}` : 'B: —';
                    const after = stats.avgAfter !== null ? `A: ${stats.avgAfter}` : 'A: —';
                    const unit = hasAny ? ' mg/dL' : '';
                    return (
                      <>
                        <span className="whitespace-nowrap">{before}</span>
                        <span className="opacity-40">•</span>
                        <span className="whitespace-nowrap">{after}{unit}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: "Today's" },
              { key: 'completed', label: 'Completed' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 focus-ring ${
                  filter === key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-pressed={filter === key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Workout List with improved animations */}
      <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6">
        {/* Date filter row (compact) */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mr-2">Date</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-base px-3 py-1.5 text-xs font-semibold w-auto"
              aria-label="Filter by date"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="px-2 py-1.5 rounded-full text-xs font-semibold border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus-ring"
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {workouts.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200 shadow-soft animate-float hover:shadow-glow-blue transition-all duration-300 hover:scale-110">
              <FiActivity size={40} className="text-blue-500 animate-pulse-gentle" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 animate-slide-up text-shadow-sm">Ready to start your fitness journey?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed animate-slide-up animate-delay-100 max-w-sm mx-auto">
              Create your first workout and begin tracking your progress towards a healthier you!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-8 py-4 text-lg animate-slide-up animate-delay-200 hover:shadow-glow-blue group"
            >
              <span className="mr-2 transition-transform duration-200 group-hover:rotate-90">
                <FiPlus size={20} />
              </span>
              Create First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkouts
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((workout, index) => (
                <div
                  key={workout.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <WorkoutCard
                    workout={workout}
                    onSelect={handleSelectWorkout}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteWorkout}
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Workout Modal */}
      <AddWorkoutModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddWorkout={handleAddWorkout}
        uid={user ? user.uid : undefined}
      />
    </div>
  );
}

export default App;

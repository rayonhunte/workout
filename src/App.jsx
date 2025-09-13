import React, { useState, useEffect } from 'react';
import { FiPlus, FiActivity, FiTrendingUp } from 'react-icons/fi';
import WorkoutCard from './components/WorkoutCard';
import WorkoutDetails from './components/WorkoutDetails';
import AddWorkoutModal from './components/AddWorkoutModal';
import ThemeToggle from './components/ThemeToggle';
import GoogleSignInButton from './components/GoogleSignInButton';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { listenUserWorkouts, addUserWorkout, updateUserWorkout } from './utils/firestoreWorkouts';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'
  const [filter, setFilter] = useState('all'); // all | today | completed
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

  const handleSelectWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    setCurrentView('list');
  };

  // Add workout to Firestore
  const handleAddWorkout = async (newWorkout) => {
    if (!user) return;
    await addUserWorkout(user.uid, newWorkout);
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

  const stats = {
    total: workouts.length,
    completed: workouts.filter(w => w.completed).length,
    today: workouts.filter(w => {
      const today = new Date().toDateString();
      const workoutDate = new Date(w.date).toDateString();
      return today === workoutDate;
    }).length
  };

  const filteredWorkouts = workouts.filter((w) => {
    if (filter === 'today') {
      return new Date(w.date).toDateString() === new Date().toDateString();
    }
    if (filter === 'completed') {
      return w.completed;
    }
    return true;
  });

  if (currentView === 'details' && selectedWorkout) {
    return (
      <WorkoutDetails
        workout={selectedWorkout}
        onBack={handleBackToList}
        onUpdateWorkout={handleUpdateWorkout}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900">
        <h1 className="text-3xl font-bold mb-6 gradient-text text-shadow-sm">Workout Tracker</h1>
        <GoogleSignInButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 animate-fade-in">
      {/* Enhanced Header with improved animations */}
      <div className="glass shadow-soft sticky top-0 z-10 border-b border-white/20 animate-slide-down">
        <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="animate-slide-up flex-1 pr-3">
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text text-shadow-sm animate-float">
                Workout Tracker
              </h1>
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
            </div>
          </div>

          {/* Enhanced Stats with staggered animations */}
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
      />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { FiPlus, FiActivity, FiTrendingUp } from 'react-icons/fi';
import WorkoutCard from './components/WorkoutCard';
import WorkoutDetails from './components/WorkoutDetails';
import AddWorkoutModal from './components/AddWorkoutModal';
import { sampleWorkouts } from './data/workouts';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'

  // Load workouts from localStorage or use sample data
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    } else {
      setWorkouts(sampleWorkouts);
    }
  }, []);

  // Save workouts to localStorage whenever workouts change
  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  const handleSelectWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    setCurrentView('list');
  };

  const handleUpdateWorkout = (updatedWorkout) => {
    setWorkouts(workouts.map(w => 
      w.id === updatedWorkout.id ? updatedWorkout : w
    ));
  };

  const handleToggleComplete = (workoutId) => {
    setWorkouts(workouts.map(w => 
      w.id === workoutId ? { ...w, completed: !w.completed } : w
    ));
  };

  const handleAddWorkout = (newWorkout) => {
    setWorkouts([...workouts, newWorkout]);
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

  if (currentView === 'details' && selectedWorkout) {
    return (
      <WorkoutDetails
        workout={selectedWorkout}
        onBack={handleBackToList}
        onUpdateWorkout={handleUpdateWorkout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Workout Tracker
              </h1>
              <p className="text-sm text-gray-600 mt-1">Track your fitness journey</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <FiPlus size={24} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center text-blue-500 mb-2">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <FiActivity size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-xs text-blue-600 font-medium">Total Workouts</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center text-green-500 mb-2">
                <div className="p-2 bg-green-500 text-white rounded-lg">
                  <FiTrendingUp size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
              <div className="text-xs text-green-600 font-medium">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center border border-orange-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center text-orange-500 mb-2">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <FiActivity size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-700">{stats.today}</div>
              <div className="text-xs text-orange-600 font-medium">Today's Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout List */}
      <div className="max-w-md mx-auto px-4 py-6">
        {workouts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
              <FiActivity size={40} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ready to start your fitness journey?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Create your first workout and begin tracking your progress towards a healthier you!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              Create First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onSelect={handleSelectWorkout}
                  onToggleComplete={handleToggleComplete}
                />
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

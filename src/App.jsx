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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Workout Tracker</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              <FiPlus size={24} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center text-blue-500 mb-1">
                <FiActivity size={16} />
              </div>
              <div className="text-lg font-semibold text-blue-700">{stats.total}</div>
              <div className="text-xs text-blue-600">Total Workouts</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center text-green-500 mb-1">
                <FiTrendingUp size={16} />
              </div>
              <div className="text-lg font-semibold text-green-700">{stats.completed}</div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center text-orange-500 mb-1">
                <FiActivity size={16} />
              </div>
              <div className="text-lg font-semibold text-orange-700">{stats.today}</div>
              <div className="text-xs text-orange-600">Today's Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout List */}
      <div className="max-w-md mx-auto px-4 py-6">
        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <FiActivity size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No workouts yet</h3>
            <p className="text-gray-400 mb-4">Create your first workout to get started!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Workout
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

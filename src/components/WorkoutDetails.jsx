import React, { useState } from 'react';
import { FiArrowLeft, FiCheck, FiDroplet, FiSave } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';

const WorkoutDetails = ({ workout, onBack, onUpdateWorkout }) => {
  const [localWorkout, setLocalWorkout] = useState(workout);
  const [bloodSugarBefore, setBloodSugarBefore] = useState(workout.bloodSugar.before || '');
  const [bloodSugarAfter, setBloodSugarAfter] = useState(workout.bloodSugar.after || '');

  const toggleExercise = (index) => {
    const updatedExercises = [...localWorkout.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      completed: !updatedExercises[index].completed
    };
    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises
    });
  };

  const saveWorkout = () => {
    const updatedWorkout = {
      ...localWorkout,
      bloodSugar: {
        before: bloodSugarBefore ? parseInt(bloodSugarBefore) : null,
        after: bloodSugarAfter ? parseInt(bloodSugarAfter) : null,
      },
      completed: localWorkout.exercises.every(ex => ex.completed)
    };
    onUpdateWorkout(updatedWorkout);
    onBack();
  };

  const completedExercises = localWorkout.exercises.filter(ex => ex.completed).length;
  const totalExercises = localWorkout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center mb-2">
          <button 
            onClick={onBack}
            className="mr-3 p-1 rounded-full hover:bg-blue-600 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">{localWorkout.name}</h1>
        </div>
        <p className="text-blue-100 text-sm">{formatDate(localWorkout.date)}</p>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-blue-100 mb-1">
            <span>{completedExercises}/{totalExercises} exercises</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Blood Sugar Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <FiDroplet className="mr-2" />
            Blood Sugar Levels
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                Before Workout (mg/dL)
              </label>
              <input
                type="number"
                value={bloodSugarBefore}
                onChange={(e) => setBloodSugarBefore(e.target.value)}
                placeholder="Enter blood sugar level"
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                After Workout (mg/dL)
              </label>
              <input
                type="number"
                value={bloodSugarAfter}
                onChange={(e) => setBloodSugarAfter(e.target.value)}
                placeholder="Enter blood sugar level"
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Exercises Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Exercises</h2>
          <div className="space-y-3">
            {localWorkout.exercises.map((exercise, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  exercise.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      exercise.completed ? 'text-green-800 line-through' : 'text-gray-800'
                    }`}>
                      {exercise.name}
                    </h3>
                    <p className={`text-sm ${
                      exercise.completed ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExercise(index)}
                    className={`p-2 rounded-full transition-colors ${
                      exercise.completed
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                  >
                    <FiCheck size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={saveWorkout}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <FiSave className="mr-2" />
          Save Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutDetails;
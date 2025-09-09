import React from 'react';
import { FiActivity, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatDate, isToday } from '../utils/helpers';

const WorkoutCard = ({ workout, onSelect, onToggleComplete }) => {
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 cursor-pointer transition-all hover:shadow-lg ${
        workout.completed ? 'border-green-500 bg-green-50' : 
        isToday(workout.date) ? 'border-blue-500' : 'border-gray-300'
      }`}
      onClick={() => onSelect(workout)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{workout.name}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="mr-1" />
            {formatDate(workout.date)}
            {isToday(workout.date) && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Today
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(workout.id);
          }}
          className={`p-2 rounded-full transition-colors ${
            workout.completed 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <FiCheckCircle size={20} />
        </button>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span className="flex items-center">
            <FiActivity className="mr-1" />
            Progress: {completedExercises}/{totalExercises} exercises
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              workout.completed ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <FiClock className="mr-1" />
          {workout.exercises.length} exercises
        </span>
        <div className="flex space-x-4">
          <span>Before: {workout.bloodSugar.before ? `${workout.bloodSugar.before} mg/dL` : 'Not recorded'}</span>
          <span>After: {workout.bloodSugar.after ? `${workout.bloodSugar.after} mg/dL` : 'Not recorded'}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
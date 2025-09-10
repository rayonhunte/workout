import React from 'react';
import { FiActivity, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatDate, isToday } from '../utils/helpers';

const WorkoutCard = ({ workout, onSelect, onToggleComplete }) => {
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div 
      className={`bg-white rounded-2xl shadow-md p-5 mb-4 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
        workout.completed ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100/50' : 
        isToday(workout.date) ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onClick={() => onSelect(workout)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{workout.name}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <FiCalendar className="mr-2" size={14} />
              {formatDate(workout.date)}
            </div>
            {isToday(workout.date) && (
              <span className="ml-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
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
          className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
            workout.completed 
              ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-lg' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <FiCheckCircle size={22} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="flex items-center font-medium">
            <div className="p-1 bg-blue-100 rounded mr-2">
              <FiActivity size={14} className="text-blue-600" />
            </div>
            Progress: {completedExercises}/{totalExercises} exercises
          </span>
          <span className="font-bold text-lg text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${
              workout.completed ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <FiClock className="mr-2" size={14} />
          <span className="font-medium">{workout.exercises.length} exercises</span>
        </span>
        <div className="flex space-x-4 text-gray-500">
          <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <span className="font-medium">Before:</span> {workout.bloodSugar.before ? `${workout.bloodSugar.before} mg/dL` : 'Not recorded'}
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded-lg">
            <span className="font-medium">After:</span> {workout.bloodSugar.after ? `${workout.bloodSugar.after} mg/dL` : 'Not recorded'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
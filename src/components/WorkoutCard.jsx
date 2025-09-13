import React from 'react';
import { FiActivity, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatDate, isToday } from '../utils/helpers';

const WorkoutCard = ({ workout, onSelect, onToggleComplete }) => {
  const completedExercises = workout.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div 
      className={`group relative card-interactive p-5 mb-4 border-l-4 overflow-hidden transition-all duration-300 hover:shadow-strong hover:-translate-y-2 hover:scale-[1.02] ${
        workout.completed ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 hover:shadow-glow-green' : 
        isToday(workout.date) ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:shadow-glow-blue' : 'border-gray-300 hover:border-blue-400'
      }`}
      onClick={() => onSelect(workout)}
    >
      {/* Subtle background animation overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-shadow-sm group-hover:text-gray-900 transition-colors duration-300">{workout.name}</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 shadow-sm">
              <FiCalendar className="mr-2 text-gray-500" size={14} />
              <span className="font-medium">{formatDate(workout.date)}</span>
            </div>
            {isToday(workout.date) && (
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 animate-pulse-gentle">
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
          className={`relative p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus-ring group/btn ${
            workout.completed 
              ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-lg hover:shadow-glow-green' 
              : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-500 hover:shadow-md'
          }`}
        >
          <FiCheckCircle size={22} className="transition-transform duration-200 group-hover/btn:rotate-12" />
          {workout.completed && (
            <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
          )}
        </button>
      </div>

      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="flex items-center font-medium">
            <div className="p-1.5 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-200">
              <FiActivity size={14} className="text-blue-600" />
            </div>
            <span className="text-gray-700">Progress: <span className="font-bold">{completedExercises}/{totalExercises}</span> exercises</span>
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-700 group-hover:text-gray-800 transition-colors duration-200">{Math.round(progress)}%</span>
            {progress === 100 && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        <div className="progress-bar bg-gray-200 shadow-inner">
          <div 
            className={`progress-fill relative overflow-hidden ${
              workout.completed ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect for progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center text-gray-500 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm">
          <FiClock className="mr-2 text-gray-400" size={14} />
          <span className="font-semibold text-gray-600">{workout.exercises.length} exercises</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-gray-500">
          <div className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm">
            <span className="font-semibold text-gray-600">Before:</span> 
            <span className={`ml-1 ${workout.bloodSugar.before ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {workout.bloodSugar.before ? `${workout.bloodSugar.before} mg/dL` : 'Not recorded'}
            </span>
          </div>
          <div className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm">
            <span className="font-semibold text-gray-600">After:</span> 
            <span className={`ml-1 ${workout.bloodSugar.after ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
              {workout.bloodSugar.after ? `${workout.bloodSugar.after} mg/dL` : 'Not recorded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
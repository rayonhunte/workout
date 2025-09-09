import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { workoutTemplates } from '../data/workouts';
import { generateId } from '../utils/helpers';

const AddWorkoutModal = ({ isOpen, onClose, onAddWorkout }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([
    { name: '', sets: 1, reps: '' }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 1, reps: '' }]);
  };

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: field === 'sets' ? parseInt(value) || 1 : value
    };
    setExercises(updatedExercises);
  };

  const loadTemplate = (template) => {
    setWorkoutName(template.name);
    setExercises(template.exercises.map(ex => ({ ...ex, completed: false })));
    setSelectedTemplate(template.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workoutName.trim() || exercises.some(ex => !ex.name.trim() || !ex.reps)) {
      alert('Please fill in all required fields');
      return;
    }

    const newWorkout = {
      id: generateId(),
      date: selectedDate,
      name: workoutName.trim(),
      exercises: exercises.map(ex => ({
        ...ex,
        completed: false
      })),
      bloodSugar: {
        before: null,
        after: null,
      },
      completed: false,
    };

    onAddWorkout(newWorkout);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setWorkoutName('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setExercises([{ name: '', sets: 1, reps: '' }]);
    setSelectedTemplate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add New Workout</h2>
            <p className="text-sm text-gray-600 mt-1">Create your personalized workout plan</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/80 transition-all duration-200 text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Workout Templates */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quick Templates
            </label>
            <div className="grid grid-cols-1 gap-3">
              {workoutTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => loadTemplate(template)}
                  className={`text-left p-4 border-2 rounded-xl hover:shadow-md transition-all duration-200 ${
                    selectedTemplate === template.name 
                      ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {template.exercises.length} exercises included
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workout Name */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Workout Name *
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Enter workout name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-400 transition-all duration-200"
              required
            />
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-blue-400 transition-all duration-200"
              required
            />
          </div>

          {/* Exercises */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Exercises *
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center text-blue-500 hover:text-blue-600 text-sm"
              >
                <FiPlus size={16} className="mr-1" />
                Add Exercise
              </button>
            </div>
            
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Exercise {index + 1}
                    </span>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Reps (e.g., 15 or 30 sec)"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Add Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkoutModal;
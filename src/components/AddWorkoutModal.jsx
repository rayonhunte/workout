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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Add New Workout</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Workout Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Templates
            </label>
            <div className="grid grid-cols-1 gap-2">
              {workoutTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => loadTemplate(template)}
                  className={`text-left p-3 border rounded-lg hover:bg-blue-50 transition-colors ${
                    selectedTemplate === template.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-800">{template.name}</div>
                  <div className="text-sm text-gray-600">
                    {template.exercises.length} exercises
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workout Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workout Name *
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Enter workout name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
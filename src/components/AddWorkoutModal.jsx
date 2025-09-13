import { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { workoutTemplates } from "../data/workouts";
import { generateId } from "../utils/helpers";

const AddWorkoutModal = ({ isOpen, onClose, onAddWorkout }) => {
  const [workoutName, setWorkoutName] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [exercises, setExercises] = useState([{ name: "", sets: 1, reps: "" }]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const addExercise = () => {
  setExercises([{ name: "", sets: 1, reps: "" }, ...exercises]);
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
      [field]: field === "sets" ? parseInt(value) || 1 : value,
    };
    setExercises(updatedExercises);
  };

  const loadTemplate = (template) => {
    setWorkoutName(template.name);
    setExercises(template.exercises.map((ex) => ({ ...ex, completed: false })));
    setSelectedTemplate(template.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !workoutName.trim() ||
      exercises.some((ex) => !ex.name.trim() || !ex.reps)
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newWorkout = {
      id: generateId(),
      date: selectedDate,
      name: workoutName.trim(),
      exercises: exercises.map((ex) => ({
        ...ex,
        completed: false,
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
    setWorkoutName("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setExercises([{ name: "", sets: 1, reps: "" }]);
    setSelectedTemplate("");
  };

  return (
    <Transition show={isOpen}>
  <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel className="modal-content bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[95vh] sm:max-h-screen overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Add New Workout
                  </DialogTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Create your personalized workout plan
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/80 dark:hover:bg-gray-800/60 transition-all duration-200 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Workout Templates */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Quick Templates
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {workoutTemplates.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => loadTemplate(template)}
                        className={`group relative text-left p-5 border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                          selectedTemplate === template.name
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-purple-900/20 shadow-xl scale-[1.02]"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-lg"
                        }`}
                      >
                        {/* Selection indicator */}
                        {selectedTemplate === template.name && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="pr-8">
                          <div className={`font-bold text-lg mb-2 transition-colors duration-200 ${
                            selectedTemplate === template.name 
                              ? "text-blue-800 dark:text-blue-200" 
                              : "text-gray-800 dark:text-gray-100 group-hover:text-blue-700"
                          }`}>
                            {template.name}
                          </div>
                          
                          <div className={`text-sm mb-3 transition-colors duration-200 ${
                            selectedTemplate === template.name 
                              ? "text-blue-600 dark:text-blue-300" 
                              : "text-gray-600 dark:text-gray-300 group-hover:text-gray-700"
                          }`}>
                            {template.exercises.length} exercises • Perfect for quick workouts
                          </div>
                          
                          {/* Exercise preview */}
                          <div className="space-y-1">
                            {template.exercises.slice(0, 2).map((exercise, exerciseIndex) => (
                              <div 
                                key={exerciseIndex}
                                className={`text-xs px-2 py-1 rounded-md inline-block mr-2 transition-colors duration-200 ${
                                  selectedTemplate === template.name
                                    ? "bg-blue-200/60 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-gray-700 group-hover:text-blue-700"
                                }`}
                              >
                                {exercise.name}
                              </div>
                            ))}
                            {template.exercises.length > 2 && (
                              <div className={`text-xs px-2 py-1 rounded-md inline-block transition-colors duration-200 ${
                                selectedTemplate === template.name
                                  ? "bg-blue-200/60 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-gray-700 group-hover:text-blue-700"
                              }`}>
                                +{template.exercises.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                          selectedTemplate === template.name 
                            ? "bg-gradient-to-br from-blue-400/10 to-purple-400/10" 
                            : "bg-gradient-to-br from-blue-400/5 to-purple-400/5"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Workout Name */}
                <div className="mb-6 animate-slide-up animate-delay-100">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Workout Name *
                  </label>
                  <input
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="Enter workout name"
                    className="input-base px-4 py-4 text-lg font-medium placeholder-gray-400 hover:shadow-md focus:shadow-lg"
                    required
                  />
                </div>

                {/* Enhanced Date */}
                <div className="mb-6 animate-slide-up animate-delay-200">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-base px-4 py-4 text-lg font-medium hover:shadow-md focus:shadow-lg"
                    required
                  />
                </div>

                {/* Exercises */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Exercises *
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addExercise}
                      className="group flex items-center px-5 py-3 text-blue-600 dark:text-blue-200 hover:text-white bg-blue-50 dark:bg-blue-900/20 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-lg border border-blue-200 dark:border-blue-800 hover:border-transparent focus-ring"
                    >
                      <FiPlus size={16} className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
                      Add Exercise
                    </button>
                  </div>

                  <div className="space-y-5">
                    {exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="group relative border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-[1.01]"
                      >
                        {/* Exercise header with enhanced styling */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {index + 1}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                Exercise {index + 1}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {exercise.name || 'Unnamed exercise'}
                              </p>
                            </div>
                          </div>
                          {exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExercise(index)}
                              className="group/delete p-2.5 text-red-400 hover:text-white bg-red-50 dark:bg-red-900/20 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm hover:shadow-lg border border-red-200 dark:border-red-800 hover:border-transparent opacity-0 group-hover:opacity-100"
                            >
                              <FiTrash2 size={16} className="transition-transform duration-200 group-hover/delete:rotate-12" />
                            </button>
                          )}
                        </div>

                        {/* Enhanced input fields */}
                        <div className="space-y-4">
                          {/* Exercise name with improved styling */}
                          <div className="relative">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                              Exercise Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Push-ups, Squats, Plank..."
                              value={exercise.name}
                              onChange={(e) =>
                                updateExercise(index, "name", e.target.value)
                              }
                              className="input-base px-4 py-3.5 text-gray-800 dark:text-gray-100 font-medium placeholder-gray-400 hover:shadow-md"
                              required
                            />
                            {/* Visual indicator for filled state */}
                            {exercise.name && (
                              <div className="absolute right-3 top-9 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>

                          {/* Sets and Reps with enhanced grid layout */}
                            <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Sets
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="3"
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    updateExercise(index, "sets", e.target.value)
                                  }
                                  className="input-base px-4 py-3.5 text-gray-800 dark:text-gray-100 font-medium text-center hover:shadow-md"
                                  min="1"
                                  max="20"
                                  required
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-medium">
                                  sets
                                </div>
                              </div>
                            </div>
                            <div className="relative">
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Reps / Duration
                              </label>
                              <input
                                type="text"
                                placeholder="15 or 30 sec"
                                value={exercise.reps}
                                onChange={(e) =>
                                  updateExercise(index, "reps", e.target.value)
                                }
                                className="input-base px-4 py-3.5 text-gray-800 dark:text-gray-100 font-medium hover:shadow-md"
                                required
                              />
                            </div>
                          </div>

                          {/* Progress indicator for completion */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                exercise.name && exercise.reps && exercise.sets 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              }`}></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {exercise.name && exercise.reps && exercise.sets 
                                  ? 'Complete' 
                                  : 'Fill all fields'}
                              </span>
                            </div>
                            {exercise.name && exercise.reps && exercise.sets && (
                              <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                                ✓ Ready
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtle gradient overlay for visual depth */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced add exercise prompt when no exercises */}
                  {exercises.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FiPlus size={24} className="text-white" />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">No exercises added yet</p>
                      <p className="text-sm text-gray-500 mb-4">Click "Add Exercise" to get started</p>
                      <button
                        type="button"
                        onClick={addExercise}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Add Your First Exercise
                      </button>
                    </div>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100 mt-6 animate-slide-up animate-delay-400">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="btn-secondary flex-1 px-6 py-4 text-lg font-semibold hover:shadow-md focus-ring"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 px-6 py-4 text-lg font-semibold hover:shadow-glow-blue focus-ring"
                  >
                    <span className="mr-2">
                      <FiPlus size={20} />
                    </span>
                    Add Workout
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddWorkoutModal;

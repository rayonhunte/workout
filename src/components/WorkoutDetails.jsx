import React, { useState } from "react";
import { FiArrowLeft, FiCheck, FiDroplet, FiSave, FiEdit, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { formatDate } from "../utils/helpers";

const WorkoutDetails = ({ workout, onBack, onUpdateWorkout, onDelete }) => {
  const [localWorkout, setLocalWorkout] = useState(workout);
  const [bloodSugarBefore, setBloodSugarBefore] = useState(
    workout.bloodSugar.before || ""
  );
  const [bloodSugarAfter, setBloodSugarAfter] = useState(
    workout.bloodSugar.after || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [exerciseModal, setExerciseModal] = useState(null);

  const setName = (name) => setLocalWorkout({ ...localWorkout, name });
  const setDate = (date) => setLocalWorkout({ ...localWorkout, date });

  const addExercise = () => {
    setLocalWorkout({
      ...localWorkout,
      exercises: [
        ...localWorkout.exercises,
        { name: "", sets: 1, reps: "", details: "", completed: false },
      ],
    });
  };

  const removeExercise = (index) => {
    const updated = localWorkout.exercises.filter((_, i) => i !== index);
    setLocalWorkout({ ...localWorkout, exercises: updated });
  };

  const updateExercise = (index, field, value) => {
    const updated = [...localWorkout.exercises];
    updated[index] = {
      ...updated[index],
      [field]: field === "sets" ? Math.max(1, parseInt(value) || 1) : value,
    };
    setLocalWorkout({ ...localWorkout, exercises: updated });
  };

  const toggleExercise = (index) => {
    const updatedExercises = [...localWorkout.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      completed: !updatedExercises[index].completed,
    };
    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  const saveWorkout = () => {
    const updatedWorkout = {
      ...localWorkout,
      bloodSugar: {
        before: bloodSugarBefore ? parseInt(bloodSugarBefore) : null,
        after: bloodSugarAfter ? parseInt(bloodSugarAfter) : null,
      },
      completed: localWorkout.exercises.every((ex) => ex.completed),
    };
    onUpdateWorkout(updatedWorkout);
    onBack();
  };

  const openExerciseModal = (index) => {
    const target = localWorkout.exercises[index];
    if (!target) return;
    setExerciseModal({
      index,
      data: {
        name: target.name || "",
        sets: target.sets ? String(target.sets) : "1",
        reps: target.reps || "",
        details: target.details || "",
      },
    });
  };

  const closeExerciseModal = () => setExerciseModal(null);

  const updateExerciseModalField = (field, value) => {
    setExerciseModal((prev) =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              [field]: field === "sets" ? value.replace(/[^\d]/g, "") : value,
            },
          }
        : prev
    );
  };

  const saveExerciseModal = () => {
    if (!exerciseModal) return;
    const { index, data } = exerciseModal;
    const sanitizedSets = Math.max(1, parseInt(data.sets, 10) || 1);
    const updatedExercises = [...localWorkout.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      name: data.name.trim() || updatedExercises[index].name || `Exercise ${index + 1}`,
      sets: sanitizedSets,
      reps: data.reps.trim(),
      details: data.details.trim(),
    };
    setLocalWorkout({ ...localWorkout, exercises: updatedExercises });
    closeExerciseModal();
  };

  const completedExercises = localWorkout.exercises.filter(
    (ex) => ex.completed
  ).length;
  const totalExercises = localWorkout.exercises.length;
  const progress =
    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 animate-fade-in">
      {/* Header uses solid dark background for readability */}
      <div className="bg-gray-800 text-white shadow-soft border-b border-gray-700 animate-slide-down">
        <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6">
          <div className="flex items-center mb-4 animate-slide-up">
            <button
              onClick={onBack}
              aria-label="Back to list"
              title="Back"
              className="mr-4 p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 group focus-ring"
            >
              <FiArrowLeft
                size={20}
                className="text-gray-700 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:-translate-x-1"
              />
            </button>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={localWorkout.name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Workout name"
                    className="input-base w-full px-4 py-3 text-lg font-bold"
                  />
                  <input
                    type="date"
                    value={localWorkout.date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-base w-full px-4 py-2"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">
                    {localWorkout.name}
                  </h1>
                  <p className="text-sm text-gray-200 mt-1 smooth-colors">
                    {formatDate(localWorkout.date)}
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              aria-label={isEditing ? "Stop editing" : "Edit workout"}
              title={isEditing ? "Done" : "Edit"}
              className="ml-2 p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 focus-ring"
            >
              <FiEdit size={18} className="text-gray-600 dark:text-gray-200" />
            </button>
          </div>

          {/* Enhanced Progress Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/40 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-up animate-delay-100">
            <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-200 mb-4">
              <span className="flex items-center font-medium">
                <div className="p-2 bg-blue-500 text-white rounded-lg mr-3 shadow-md">
                  <FiCheck size={14} />
                </div>
                <span className="text-blue-800">
                  Progress:{" "}
                  <span className="font-bold">
                    {completedExercises}/{totalExercises}
                  </span>{" "}
                  exercises
                </span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-blue-800 dark:text-blue-200">
                  {Math.round(progress)}%
                </span>
                {progress === 100 && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce-gentle"></div>
                )}
              </div>
            </div>
            <div className="progress-bar bg-blue-200 dark:bg-blue-900/40 shadow-inner">
              <div
                className={`progress-fill relative overflow-hidden ${
                  localWorkout.completed
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : "bg-gradient-to-r from-blue-400 to-blue-500"
                }`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mobile-padding py-4 sm:py-6 pb-8 sm:pb-10">
        {/* Enhanced Blood Sugar Section */}
        <div className="card-base p-6 mb-6 hover:shadow-strong hover:-translate-y-2 animate-slide-up animate-delay-200">
          {/* Enhanced Header with Gradient Background */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 -m-6 mb-6 p-6 rounded-t-2xl border-b border-red-100/50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl mr-4 shadow-lg shadow-red-200/50">
                <FiDroplet size={20} />
              </div>
              <div>
                <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Blood Sugar Levels
                </span>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Track your glucose before and after workout
                </p>
              </div>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Before Workout Input */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Before Workout
                <span className="text-xs text-gray-500 ml-2 font-normal">
                  (mg/dL)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bloodSugarBefore}
                  onChange={(e) => setBloodSugarBefore(e.target.value)}
                  placeholder="Enter blood sugar level"
                  className="input-base px-5 py-4 text-lg font-medium bg-gradient-to-br from-gray-50 to-white group-hover:bg-white hover:border-blue-300 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900"
                />
                {bloodSugarBefore && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          parseInt(bloodSugarBefore) >= 70 &&
                          parseInt(bloodSugarBefore) <= 180
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500 font-medium">
                        {parseInt(bloodSugarBefore) >= 70 &&
                        parseInt(bloodSugarBefore) <= 180
                          ? "Normal"
                          : "Monitor"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* After Workout Input */}
            <div className="group">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                After Workout
                <span className="text-xs text-gray-500 ml-2 font-normal">
                  (mg/dL)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bloodSugarAfter}
                  onChange={(e) => setBloodSugarAfter(e.target.value)}
                  placeholder="Enter blood sugar level"
                  className="input-base px-5 py-4 text-lg font-medium bg-gradient-to-br from-gray-50 to-white group-hover:bg-white hover:border-green-300 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900"
                />
                {bloodSugarAfter && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          parseInt(bloodSugarAfter) >= 70 &&
                          parseInt(bloodSugarAfter) <= 180
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500 font-medium">
                        {parseInt(bloodSugarAfter) >= 70 &&
                        parseInt(bloodSugarAfter) <= 180
                          ? "Normal"
                          : "Monitor"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Blood Sugar Change Indicator */}
            {bloodSugarBefore && bloodSugarAfter && (
              <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    Blood Sugar Change
                  </span>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const change =
                        parseInt(bloodSugarAfter) - parseInt(bloodSugarBefore);
                      const isDecrease = change < 0;
                      const isIncrease = change > 0;
                      return (
                        <>
                          <span
                            className={`text-lg font-bold ${
                              isDecrease
                                ? "text-green-600"
                                : isIncrease
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {change > 0 ? "+" : ""}
                            {change} mg/dL
                          </span>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isDecrease
                                ? "bg-green-500"
                                : isIncrease
                                ? "bg-red-500"
                                : "bg-gray-400"
                            }`}
                          ></div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {(() => {
                    const change =
                      parseInt(bloodSugarAfter) - parseInt(bloodSugarBefore);
                    if (change < 0)
                      return "Great! Exercise helped lower your blood sugar.";
                    if (change > 0)
                      return "Blood sugar increased. Consider monitoring closely.";
                    return "No change in blood sugar levels.";
                  })()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Exercises Section */}
        <div className="card-base p-6 hover:shadow-strong hover:-translate-y-2 animate-slide-up animate-delay-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center justify-between">
            <div className="p-2 bg-blue-500 text-white rounded-lg mr-3">
              <FiCheck size={18} />
            </div>
            <span>Exercises</span>
            {isEditing && (
              <button
                type="button"
                onClick={addExercise}
                className="ml-auto inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 focus-ring"
                aria-label="Add exercise"
                title="Add exercise"
              >
                <FiPlus className="mr-2" size={14} /> Add
              </button>
            )}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {localWorkout.exercises.map((exercise, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-gray-900 rounded-xl border-2 p-4 sm:p-5 transition-all duration-300 hover:shadow-strong transform hover:-translate-y-2 hover:scale-[1.02] animate-slide-up overflow-hidden ${
                  exercise.completed
                    ? "border-green-400 bg-gradient-to-br from-green-50 via-green-25 to-white shadow-glow-green/30"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-glow-blue/30"
                }`}
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                {/* Enhanced Completion Status Indicator */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 rounded-t-xl transition-all duration-300 ${
                    exercise.completed
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-blue-300 group-hover:to-blue-400"
                  }`}
                ></div>

                {/* Subtle background animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"></div>

                <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                  {/* Left column: number + checkbox */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div
                      className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold mb-2 transition-all duration-300 shadow-md ${
                        exercise.completed
                          ? "bg-green-500 text-white shadow-glow-green/50"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:shadow-md"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => toggleExercise(index)}
                        className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 focus-ring group/checkbox ${
                          exercise.completed
                            ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200/50 hover:bg-green-600 hover:border-green-600 hover:shadow-glow-green"
                            : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 hover:shadow-md group-hover:border-blue-300"
                        }`}
                        aria-label={exercise.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <FiCheck
                          size={18}
                          className={`transition-all duration-300 ${
                            exercise.completed
                              ? "scale-100 opacity-100"
                              : "scale-75 opacity-60 group-hover:scale-90 group-hover:opacity-80"
                          }`}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover/checkbox:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </button>
                    )}
                  </div>

                  {/* Right column: content */}
                  <div className="flex-1 pr-0 sm:pr-2">
                    <div className="mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, "name", e.target.value)}
                          placeholder={`Exercise ${index + 1}`}
                          className="input-base w-full max-w-full px-3 py-2 font-semibold text-base sm:text-lg"
                        />
                      ) : (
                        <h3
                          className={`font-bold text-base sm:text-lg transition-all duration-300 text-shadow-sm ${
                            exercise.completed
                              ? "text-green-800"
                              : "text-gray-800 group-hover:text-blue-800 dark:text-gray-100"
                          }`}
                        >
                          {exercise.name}
                        </h3>
                      )}
                    </div>

                    {/* Exercise details (sets/reps and optional details) */}
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Sets</label>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, "sets", e.target.value)}
                            className="input-base px-3 py-2 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Reps / Duration</label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, "reps", e.target.value)}
                            placeholder="15 or 30 sec"
                            className="input-base px-3 py-2"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">Details (optional)</label>
                          <textarea
                            rows={2}
                            value={exercise.details || ''}
                            onChange={(e) => updateExercise(index, 'details', e.target.value)}
                            placeholder="Notes, intervals, weights, tempo…"
                            className="input-base px-3 py-2 resize-y"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/60 dark:border-red-800/60 focus-ring"
                            aria-label="Remove exercise"
                            title="Remove exercise"
                          >
                            <FiTrash2 className="mr-1.5" size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => openExerciseModal(index)}
                          className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md focus-ring ${
                            exercise.completed
                              ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 focus-visible:shadow-glow-green/40"
                              : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 group-hover:bg-blue-100 group-hover:text-blue-700"
                          }`}
                          aria-label={`Edit ${exercise.name || `exercise ${index + 1}`} details`}
                        >
                          <span className="font-bold text-sm sm:text-base">{exercise.sets}</span>
                          <span className="mx-1 sm:mx-1.5 text-[10px] sm:text-xs">sets</span>
                          <span className="mx-1 sm:mx-1.5 text-[10px] sm:text-xs">×</span>
                          <span className="font-bold text-sm sm:text-base">{exercise.reps}</span>
                          <span className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs">reps</span>
                        </button>
                        {exercise.details && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{exercise.details}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Overlay Effect */}
                {exercise.completed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-500/10 rounded-xl pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {exerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={closeExerciseModal}
            role="presentation"
          ></div>
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 animate-slide-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Edit Exercise
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update the details and save to apply changes.
                </p>
              </div>
              <button
                type="button"
                onClick={closeExerciseModal}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200 focus-ring"
                aria-label="Close edit exercise modal"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={exerciseModal.data.name}
                  onChange={(e) => updateExerciseModalField("name", e.target.value)}
                  placeholder="Exercise name"
                  className="input-base w-full px-4 py-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={exerciseModal.data.sets}
                    onChange={(e) => updateExerciseModalField("sets", e.target.value)}
                    className="input-base w-full px-4 py-3 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                    Reps / Duration
                  </label>
                  <input
                    type="text"
                    value={exerciseModal.data.reps}
                    onChange={(e) => updateExerciseModalField("reps", e.target.value)}
                    placeholder="15 or 30 sec"
                    className="input-base w-full px-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Details (optional)
                </label>
                <textarea
                  rows={3}
                  value={exerciseModal.data.details}
                  onChange={(e) => updateExerciseModalField("details", e.target.value)}
                  placeholder="Notes, intervals, weights, tempo…"
                  className="input-base w-full px-4 py-3 resize-y"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-2">
              <button
                type="button"
                onClick={closeExerciseModal}
                className="btn-secondary px-5 py-3 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveExerciseModal}
                className="btn-primary px-5 py-3 font-semibold text-sm hover:shadow-glow-blue focus-ring"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Section (part of normal flow, not fixed) */}
      <div className="p-4 glass border-t border-white/20 shadow-2xl animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="flex gap-3">
            <button
              onClick={() => onDelete(workout.id)}
              aria-label="Delete workout"
              title="Delete workout"
              className="group relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white py-[1.35rem] px-[1.35rem] rounded-2xl font-bold text-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-strong hover:shadow-glow-red border border-red-400/20 hover:border-red-400/30 overflow-hidden focus-ring"
            >
              {/* Enhanced Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-red-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

              {/* Enhanced Icon with styling */}
              <div className="relative z-10 flex items-center">
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-md">
                  <FiTrash2 size={22} className="drop-shadow-sm" />
                </div>
              </div>

              {/* Enhanced shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </button>
            
            <button
              onClick={saveWorkout}
              aria-label="Save workout"
              title="Save workout"
              className="group relative flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white py-[1.35rem] px-[1.8rem] rounded-2xl font-bold text-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-strong hover:shadow-glow-purple border border-blue-400/20 hover:border-purple-400/30 overflow-hidden focus-ring"
            >
              {/* Enhanced Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

              {/* Enhanced Icon with styling */}
              <div className="relative z-10 flex items-center">
                <div className="p-2 bg-white/20 rounded-xl mr-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 shadow-md">
                  <FiSave size={22} className="drop-shadow-sm" />
                </div>
                <span className="drop-shadow-sm tracking-wide text-xl">
                  {isEditing ? 'Save Changes' : 'Save Workout'}
                </span>
              </div>

              {/* Enhanced shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </button>
          </div>

          {/* Enhanced helper text */}
          <p className="text-center text-xs text-gray-500 mt-4 transition-all duration-300 hover:text-gray-600 animate-fade-in animate-delay-300">
            All changes will be saved automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetails;

import React from 'react';
import WorkoutDetails from './WorkoutDetails';
import Help from './Help';
import Report from './Report';

export function renderAppRoutes({
  currentView,
  selectedWorkout,
  onBackToList,
  onUpdateWorkout,
  onDeleteWorkout,
  workouts,
}) {
  if (currentView === 'details' && selectedWorkout) {
    return (
      <WorkoutDetails
        workout={selectedWorkout}
        onBack={onBackToList}
        onUpdateWorkout={onUpdateWorkout}
        onDelete={onDeleteWorkout}
      />
    );
  }

  if (currentView === 'help') {
    return <Help onBack={onBackToList} />;
  }

  if (currentView === 'report') {
    return <Report workouts={workouts} onBack={onBackToList} />;
  }

  return null;
}

export default renderAppRoutes;

// Sample workout data
export const sampleWorkouts = [
  {
    id: 1,
    date: '2024-09-09',
    name: 'Upper Body Strength',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 15, completed: false },
      { name: 'Pull-ups', sets: 3, reps: 8, completed: false },
      { name: 'Dumbbell Press', sets: 3, reps: 12, completed: false },
      { name: 'Rows', sets: 3, reps: 12, completed: false },
    ],
    bloodSugar: {
      before: null,
      after: null,
    },
    completed: false,
  },
  {
    id: 2,
    date: '2024-09-10',
    name: 'Cardio & Core',
    exercises: [
      { name: 'Running', sets: 1, reps: '30 minutes', completed: false },
      { name: 'Planks', sets: 3, reps: '60 seconds', completed: false },
      { name: 'Bicycle Crunches', sets: 3, reps: 20, completed: false },
      { name: 'Mountain Climbers', sets: 3, reps: 30, completed: false },
    ],
    bloodSugar: {
      before: null,
      after: null,
    },
    completed: false,
  },
  {
    id: 3,
    date: '2024-09-11',
    name: 'Lower Body Strength',
    exercises: [
      { name: 'Squats', sets: 3, reps: 15, completed: false },
      { name: 'Lunges', sets: 3, reps: 12, completed: false },
      { name: 'Deadlifts', sets: 3, reps: 10, completed: false },
      { name: 'Calf Raises', sets: 3, reps: 20, completed: false },
    ],
    bloodSugar: {
      before: null,
      after: null,
    },
    completed: false,
  },
];

export const workoutTemplates = [
  {
    name: 'Quick HIIT',
    exercises: [
      { name: 'Burpees', sets: 3, reps: 10 },
      { name: 'Jumping Jacks', sets: 3, reps: 30 },
      { name: 'High Knees', sets: 3, reps: 20 },
    ],
  },
  {
    name: 'Strength Training',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Squats', sets: 3, reps: 15 },
      { name: 'Planks', sets: 3, reps: '60 seconds' },
    ],
  },
  {
    name: 'Flexibility & Stretching',
    exercises: [
      { name: 'Forward Fold', sets: 1, reps: '2 minutes' },
      { name: 'Shoulder Stretch', sets: 1, reps: '1 minute each arm' },
      { name: 'Hip Circles', sets: 1, reps: '10 each direction' },
    ],
  },
];
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isToday = (dateString) => {
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};
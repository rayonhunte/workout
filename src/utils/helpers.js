const parseLocalDate = (dateString) => {
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Interpret YYYY-MM-DD as local time to avoid UTC shift
    return new Date(`${dateString}T00:00:00`);
  }
  return new Date(dateString);
};

export const formatDate = (dateString) => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isToday = (dateString) => {
  const today = new Date();
  const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toDateString();
  const dateStr = parseLocalDate(dateString).toDateString();
  return todayStr === dateStr;
};

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

/**
 * Utility functions
 */

// Format date to readable string
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Format time duration (minutes to hours:minutes)
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Calculate percentage
export const calculatePercentage = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Get greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random color for avatar
export const getRandomColor = () => {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name.substring(0, 2);
};

// Calculate study streak
export const calculateStreak = (sessions) => {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    const hasSession = sessions.some(session => {
      const sessionDate = new Date(session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === checkDate.getTime();
    });

    if (hasSession) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
};

// Get weak subjects based on quiz results
export const getWeakSubjects = (quizResults, threshold = 60) => {
  const subjectScores = {};

  quizResults.forEach(result => {
    if (!subjectScores[result.subjectId]) {
      subjectScores[result.subjectId] = {
        total: 0,
        count: 0,
      };
    }
    subjectScores[result.subjectId].total += result.score;
    subjectScores[result.subjectId].count += 1;
  });

  const weakSubjects = [];
  Object.keys(subjectScores).forEach(subjectId => {
    const avgScore = subjectScores[subjectId].total / subjectScores[subjectId].count;
    if (avgScore < threshold) {
      weakSubjects.push({
        subjectId,
        avgScore: Math.round(avgScore),
      });
    }
  });

  return weakSubjects;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate slug from string
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

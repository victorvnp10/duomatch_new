// Preserve JavaScript multiplication/coercion and nonpositive durations.
export const getActivityDurationMillis = (days, hours, minutes) =>
  days * 86400000 + hours * 3600000 + minutes * 60000;

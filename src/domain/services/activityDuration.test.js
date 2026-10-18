import { getActivityDurationMillis } from './activityDuration';
test.each([
  [1, 2, 3, 93780000],
  [0, 0, 0, 0],
  [0, 0, 1, 60000],
  [0, -1, 0, -3600000],
  ['1', '2', '3', 93780000],
])('duration %s days %s hours %s minutes is %s milliseconds', (days, hours, minutes, expected) => {
  expect(getActivityDurationMillis(days, hours, minutes)).toBe(expected);
});

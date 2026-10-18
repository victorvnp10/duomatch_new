import { calculateAge, MIN_AGE } from './ProfileAge';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 17, 12));
});
afterEach(() => jest.useRealTimers());

test('minimum age remains eighteen', () => {
  expect(MIN_AGE).toBe(18);
});
test('birthday today counts the completed year', () => {
  expect(calculateAge('2008-10-17')).toBe(18);
});
test('birthday tomorrow has not completed the year', () => {
  expect(calculateAge('2008-10-18')).toBe(17);
});
test('earlier birth month counts the completed year', () => {
  expect(calculateAge('2008-09-30')).toBe(18);
});
test('later birth month subtracts one year', () => {
  expect(calculateAge('2008-11-01')).toBe(17);
});
test('invalid date retains the previous NaN behavior', () => {
  expect(calculateAge('invalid')).toBeNaN();
});

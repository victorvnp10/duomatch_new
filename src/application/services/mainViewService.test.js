import { recordActivitySelectionStreak, recordSuggestionSelectionStreak } from './mainViewService';
import { updateStreak } from './streakService';
jest.mock('./streakService', () => ({ updateStreak: jest.fn() }));
const selected = { id: 'chosen', selections: { partner: { status: 'confirmed' } }, name: 'Item' };
const untouched = { id: 'other' };
const context = { user: { uid: 'me' }, userData: { uid: 'me', coupleId: 'couple', nickname: 'Name' }, coupleData: { streak: 3 }, allActivities: [selected, untouched], dailySuggestions: [{ id: 'daily' }], hotSuggestions: [{ id: 'hot' }] };
beforeEach(() => jest.resetAllMocks());
test('confirmed activity selection sends exact post-selection snapshot and original arguments', () => {
  const nextSelection = { status: 'confirmed', date: '2026-10-17' };
  recordActivitySelectionStreak('chosen', { nextSelection }, context);
  expect(updateStreak).toHaveBeenCalledTimes(1);
  expect(updateStreak).toHaveBeenCalledWith('couple', { ...context.userData, coupleData: context.coupleData }, [ { ...selected, selections: { ...selected.selections, me: nextSelection } }, untouched ], context.dailySuggestions, context.hotSuggestions);
  expect(context.allActivities[0]).toBe(selected);
  expect(selected.selections).not.toHaveProperty('me');
});
test.each([undefined, {}, { nextSelection: null }, { nextSelection: { status: 'pending' } }])('unconfirmed result %p never updates streak', result => {
  recordActivitySelectionStreak('chosen', result, context);
  expect(updateStreak).not.toHaveBeenCalled();
});
test.each([null, {}, { coupleId: '' }])('absent couple %p prevents every streak write', userData => {
  recordActivitySelectionStreak('chosen', { nextSelection: { status: 'confirmed' } }, { ...context, userData });
  recordSuggestionSelectionStreak({ ...context, userData });
  expect(updateStreak).not.toHaveBeenCalled();
});
test('special/hot suggestions preserve activities identity and exact SDK-service arguments', () => {
  recordSuggestionSelectionStreak(context);
  expect(updateStreak).toHaveBeenCalledWith('couple', { ...context.userData, coupleData: context.coupleData }, context.allActivities, context.dailySuggestions, context.hotSuggestions);
  expect(updateStreak.mock.calls[0][2]).toBe(context.allActivities);
});
test.each(['activity', 'suggestion'])('%s does not introduce awaiting of streak persistence', kind => {
  updateStreak.mockReturnValue(new Promise(() => {}));
  const result = kind === 'activity' ? recordActivitySelectionStreak('chosen', { nextSelection: { status: 'confirmed' } }, context) : recordSuggestionSelectionStreak(context);
  expect(result).toBeUndefined();
  expect(updateStreak).toHaveBeenCalledTimes(1);
});
test.each(['activity', 'suggestion'])('%s preserves synchronous error identity for existing UI catch', kind => {
  const error = new Error('streak');
  updateStreak.mockImplementation(() => { throw error; });
  let caught;
  try {
    if (kind === 'activity') recordActivitySelectionStreak('chosen', { nextSelection: { status: 'confirmed' } }, context);
    else recordSuggestionSelectionStreak(context);
  } catch (err) { caught = err; }
  expect(caught).toBe(error);
});

import { withActivitySelection } from './activitySelectionSnapshot';
test('selection snapshot clones only selected item and preserves partner selections', () => {
  const other = { id: 'other' };
  const chosen = { id: 'chosen', selections: { partner: { status: 'confirmed' } } };
  const next = { status: 'confirmed' };
  const activities = [chosen, other];
  const snapshot = withActivitySelection(activities, 'chosen', 'me', next);
  expect(snapshot).toEqual([{ ...chosen, selections: { partner: chosen.selections.partner, me: next } }, other]);
  expect(snapshot).not.toBe(activities);
  expect(snapshot[0]).not.toBe(chosen);
  expect(snapshot[0].selections.me).toBe(next);
  expect(snapshot[1]).toBe(other);
  expect(chosen.selections).not.toHaveProperty('me');
});
test('missing selections retain original spread behavior', () => {
  expect(withActivitySelection([{ id: 'chosen' }], 'chosen', 'me', { status: 'confirmed' })).toEqual([{ id: 'chosen', selections: { me: { status: 'confirmed' } } }]);
});

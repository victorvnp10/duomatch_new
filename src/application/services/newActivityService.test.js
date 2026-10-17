import { buildNewActivity } from './newActivityService';
import { serverTimestamp, Timestamp } from '../../infrastructure/firebase';
import { getTodayDateString } from '../../shared/lib/dateUtils';
jest.mock('../../infrastructure/firebase', () => ({ serverTimestamp: jest.fn(), Timestamp: { fromDate: jest.fn() } }));
jest.mock('../../shared/lib/dateUtils', () => ({ getTodayDateString: jest.fn() }));
const fields = { newActivityName: '  Name  ', newActivityDescription: '  Desc  ', newActivityType: 'atividade', newActivityCategory: 'Hobbies & Outros', newActivityPoints: '2', newActivityPeriodicityType: 'none', newActivityPeriodicityValue: '', newActivityDurationDays: 1, newActivityDurationHours: 2, newActivityDurationMinutes: 3 };
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(1000);
  serverTimestamp.mockReturnValue('SERVER');
  Timestamp.fromDate.mockImplementation(date => ({ date }));
  getTodayDateString.mockReturnValue('2026-10-17');
});
afterEach(() => jest.restoreAllMocks());
test('ordinary activity has exact payload and no challenge expiry', () => {
  expect(buildNewActivity(fields, { uid: 'me' })).toEqual({ name: 'Name', description: 'Desc', type: 'atividade', category: 'Hobbies & Outros', points: 2, createdBy: 'me', createdAt: 'SERVER', selections: {}, completionStatus: null, challengeState: null, periodicity: null });
  expect(Timestamp.fromDate).not.toHaveBeenCalled();
  expect(getTodayDateString).not.toHaveBeenCalled();
});
test('periodicity retains uncoerced value and invalid points become zero', () => {
  expect(buildNewActivity({ ...fields, newActivityPoints: 'invalid', newActivityPeriodicityType: 'semanal', newActivityPeriodicityValue: '2' }, { uid: 'me' })).toMatchObject({ points: 0, periodicity: { type: 'semanal', value: '2' } });
});
test.each(['desafio', 'desafio_hot'])('%s has exact challenge state, local selection and expiry', type => {
  expect(buildNewActivity({ ...fields, newActivityType: type }, { uid: 'me' })).toEqual({ name: 'Name', description: 'Desc', type, category: type === 'desafio_hot' ? 'Hot' : 'Hobbies & Outros', points: 2, createdBy: 'me', createdAt: 'SERVER', selections: { me: { status: 'confirmed', date: '2026-10-17' } }, completionStatus: null, challengeState: 'pending_acceptance', expiresAt: { date: new Date(93781000) } });
  expect(serverTimestamp.mock.invocationCallOrder[0]).toBeLessThan(Timestamp.fromDate.mock.invocationCallOrder[0]);
  expect(Timestamp.fromDate.mock.invocationCallOrder[0]).toBeLessThan(getTodayDateString.mock.invocationCallOrder[0]);
});
test.each([0, -1])('nonpositive challenge duration %s omits expiry', hours => {
  const data = buildNewActivity({ ...fields, newActivityType: 'desafio', newActivityDurationDays: 0, newActivityDurationHours: hours, newActivityDurationMinutes: 0 }, { uid: 'me' });
  expect(data).not.toHaveProperty('expiresAt');
  expect(data).not.toHaveProperty('periodicity');
  expect(Timestamp.fromDate).not.toHaveBeenCalled();
});
test('timestamp synchronous failure retains original error identity', () => {
  const error = new Error('timestamp');
  serverTimestamp.mockImplementation(() => { throw error; });
  let caught;
  try { buildNewActivity(fields, { uid: 'me' }); } catch (err) { caught = err; }
  expect(caught).toBe(error);
});

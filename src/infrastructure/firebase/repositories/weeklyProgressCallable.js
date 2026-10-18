import { app } from '../index';

export const recordWeeklyProgress = async (event) => {
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const functions = getFunctions(app, "southamerica-east1");
  const result = await httpsCallable(functions, 'recordWeeklyProgress')(event);
  return result.data;
};

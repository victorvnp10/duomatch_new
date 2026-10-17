/** Keep a safe, actionable message while preserving the original diagnostic. */
export const contextualError = (message, cause) => {
  const error = new Error(message);
  error.cause = cause;
  return error;
};

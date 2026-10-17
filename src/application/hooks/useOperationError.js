import { useCallback, useState } from 'react';
import { contextualError } from '../services/contextualError';

/**
 * Non-fatal operation failures, separate from loading/listener failures.
 * The consumer acknowledges the error explicitly; an unrelated successful
 * operation must not erase a failure that has not yet been displayed.
 * Stable callbacks can safely be included in effect/callback dependencies.
 */
export const useOperationError = () => {
  const [operationError, setOperationError] = useState(null);
  const reportOperationError = useCallback((message, cause) => {
    const error = contextualError(message, cause);
    setOperationError(error);
    return error;
  }, []);
  const clearOperationError = useCallback(() => setOperationError(null), []);
  return { operationError, reportOperationError, clearOperationError };
};

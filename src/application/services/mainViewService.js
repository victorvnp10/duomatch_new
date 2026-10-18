import { updateStreak } from "./streakService";
import { withActivitySelection } from "../../domain/services/activitySelectionSnapshot";

// Deliberately do not await or return updateStreak: preserve existing fire-and-forget behavior.
export function recordActivitySelectionStreak(activityId, selectionResult, {
  user, userData, coupleData, allActivities, dailySuggestions, hotSuggestions,
}) {
  if (userData?.coupleId && selectionResult?.nextSelection?.status === "confirmed") {
    const activitiesAfterSelection = withActivitySelection(
      allActivities, activityId, user.uid, selectionResult.nextSelection
    );
    updateStreak(
      userData.coupleId,
      { ...userData, coupleData },
      activitiesAfterSelection,
      dailySuggestions,
      hotSuggestions
    );
  }
}

export function recordSuggestionSelectionStreak({
  userData, coupleData, allActivities, dailySuggestions, hotSuggestions,
}) {
  if (userData?.coupleId) {
    updateStreak(userData.coupleId, { ...userData, coupleData }, allActivities, dailySuggestions, hotSuggestions);
  }
}

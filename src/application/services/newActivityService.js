import { Timestamp, serverTimestamp } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/lib/dateUtils";
import { getActivityDurationMillis } from "../../domain/services/activityDuration";

// Constructs the SDK payload only; persistence and its non-awaited callback stay with the caller.
export function buildNewActivity({
  newActivityName,
  newActivityDescription,
  newActivityType,
  newActivityCategory,
  newActivityPoints,
  newActivityPeriodicityType,
  newActivityPeriodicityValue,
  newActivityDurationDays,
  newActivityDurationHours,
  newActivityDurationMinutes
}, user) {
    const dataToAdd = {
      name: newActivityName.trim(),
      description: newActivityDescription.trim(),
      type: newActivityType,
      category: newActivityType === "desafio_hot" ? "Hot" : newActivityCategory,
      points: Number(newActivityPoints) || 0,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      selections: {},
      completionStatus: null,
      challengeState: newActivityType.startsWith("desafio")
        ? "pending_acceptance"
        : null,
    };

    if (newActivityType.startsWith("desafio")) {
      const durationInMillis = getActivityDurationMillis(
        newActivityDurationDays, newActivityDurationHours, newActivityDurationMinutes
      );
      if (durationInMillis > 0)
        dataToAdd.expiresAt = Timestamp.fromDate(
          new Date(Date.now() + durationInMillis)
        );
      dataToAdd.selections[user.uid] = {
        status: "confirmed",
        date: getTodayDateString(),
      };
    } else {
      dataToAdd.periodicity =
        newActivityPeriodicityType !== "none"
          ? {
              type: newActivityPeriodicityType,
              value: newActivityPeriodicityValue,
            }
          : null;
    }

  return dataToAdd;
}

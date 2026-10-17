export const withActivitySelection = (allActivities, activityId, userId, nextSelection) =>
  allActivities.map((activity) =>
    activity.id === activityId
      ? {
          ...activity,
          selections: {
            ...activity.selections,
            [userId]: nextSelection,
          },
        }
      : activity
  );

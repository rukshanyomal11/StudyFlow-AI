function stringifyId(value) {
  if (!value) {
    return null;
  }

  return typeof value?.toString === 'function' ? value.toString() : String(value);
}

export function clampGoalProgress(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(value), 0), 100);
}

export function getGoalStatusFromProgress(progress) {
  if (progress >= 100) {
    return 'completed';
  }

  if (progress > 0) {
    return 'in_progress';
  }

  return 'pending';
}

export function calculateGoalTaskProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }

  const completedCount = tasks.filter((task) => task?.completed).length;
  return clampGoalProgress((completedCount / tasks.length) * 100);
}

function serializeGoalTask(taskDocument) {
  if (!taskDocument || typeof taskDocument !== 'object') {
    return null;
  }

  const task =
    typeof taskDocument.toObject === 'function'
      ? taskDocument.toObject()
      : taskDocument;

  return {
    ...task,
    _id: stringifyId(task._id),
    title: typeof task.title === 'string' ? task.title.trim() : '',
    completed: Boolean(task.completed),
  };
}

export function serializeGoal(goalDocument) {
  if (!goalDocument) {
    return null;
  }

  const goal =
    typeof goalDocument.toObject === 'function'
      ? goalDocument.toObject()
      : goalDocument;

  return {
    ...goal,
    _id: stringifyId(goal._id),
    userId: stringifyId(goal.userId),
    progress: clampGoalProgress(
      typeof goal.progress === 'number' ? goal.progress : 0,
    ),
    tasks: Array.isArray(goal.tasks)
      ? goal.tasks.map((task) => serializeGoalTask(task)).filter(Boolean)
      : [],
  };
}

export function serializeGoals(goalDocuments) {
  return Array.isArray(goalDocuments)
    ? goalDocuments.map((goal) => serializeGoal(goal)).filter(Boolean)
    : [];
}

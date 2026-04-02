export const TASK_PRIORITY_LABELS = Object.freeze({
  low: 'Low',
  medium: 'Medium',
  high: 'High',
});

export const TASK_PRIORITY_VALUES = Object.freeze({
  High: 'high',
  Medium: 'medium',
  Low: 'low',
});

export const TASK_STATUS_LABELS = Object.freeze({
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
  missed: 'Missed',
});

export const TASK_STATUS_VALUES = Object.freeze({
  'To Do': 'pending',
  'In Progress': 'in_progress',
  Done: 'completed',
  Missed: 'missed',
});

function stringifyId(value) {
  if (!value) {
    return null;
  }

  return typeof value?.toString === 'function' ? value.toString() : String(value);
}

export function getTaskPriorityLabel(value) {
  return TASK_PRIORITY_LABELS[value] || 'Medium';
}

export function getTaskPriorityValue(value) {
  return TASK_PRIORITY_VALUES[value] || 'medium';
}

export function getTaskStatusLabel(value) {
  return TASK_STATUS_LABELS[value] || 'To Do';
}

export function getTaskStatusValue(value) {
  return TASK_STATUS_VALUES[value] || 'pending';
}

export function getTaskSubjectName(task) {
  if (!task || typeof task !== 'object') {
    return '';
  }

  if (typeof task.subjectName === 'string' && task.subjectName.trim()) {
    return task.subjectName.trim();
  }

  const subjectDocument = task.subjectId;

  if (
    subjectDocument &&
    typeof subjectDocument === 'object' &&
    typeof subjectDocument.name === 'string'
  ) {
    return subjectDocument.name.trim();
  }

  return '';
}

export function serializeTask(taskDocument) {
  if (!taskDocument) {
    return null;
  }

  const task =
    typeof taskDocument.toObject === 'function'
      ? taskDocument.toObject()
      : taskDocument;

  const populatedSubjectId =
    task.subjectId &&
    typeof task.subjectId === 'object' &&
    '_id' in task.subjectId
      ? task.subjectId._id
      : task.subjectId;

  return {
    ...task,
    _id: stringifyId(task._id),
    userId: stringifyId(task.userId),
    subjectId: stringifyId(populatedSubjectId),
    subjectName: getTaskSubjectName(task),
  };
}

export function serializeTasks(taskDocuments) {
  return Array.isArray(taskDocuments)
    ? taskDocuments.map((task) => serializeTask(task)).filter(Boolean)
    : [];
}

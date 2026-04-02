function stringifyId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && '_id' in value) {
    return stringifyId(value._id);
  }

  return String(value);
}

function getSubjectName(subjectValue) {
  if (!subjectValue || typeof subjectValue !== 'object') {
    return '';
  }

  return typeof subjectValue.name === 'string' ? subjectValue.name : '';
}

export function serializeStudySession(session) {
  const subjectValue = session.subjectId;

  return {
    id: stringifyId(session._id),
    subjectId: stringifyId(subjectValue),
    subjectName: getSubjectName(subjectValue),
    taskId: stringifyId(session.taskId),
    goal: typeof session.goal === 'string' ? session.goal : '',
    notes: typeof session.notes === 'string' ? session.notes : '',
    startTime: session.startTime
      ? new Date(session.startTime).toISOString()
      : null,
    endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
    duration: typeof session.duration === 'number' ? session.duration : 0,
    focusScore:
      typeof session.focusScore === 'number' ? session.focusScore : 0,
    distractions:
      typeof session.distractions === 'number' ? session.distractions : 0,
    status: session.endTime ? 'completed' : 'live',
  };
}

export function serializeStudySessions(sessions) {
  return sessions.map((session) => serializeStudySession(session));
}

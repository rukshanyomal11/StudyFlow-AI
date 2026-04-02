function stringifyId(value) {
  if (!value) {
    return null;
  }

  return typeof value?.toString === 'function' ? value.toString() : String(value);
}

function getSlotSubjectName(slot) {
  if (!slot || typeof slot !== 'object') {
    return '';
  }

  if (typeof slot.subjectName === 'string' && slot.subjectName.trim()) {
    return slot.subjectName.trim();
  }

  const subjectDocument = slot.subjectId;

  if (
    subjectDocument &&
    typeof subjectDocument === 'object' &&
    typeof subjectDocument.name === 'string'
  ) {
    return subjectDocument.name.trim();
  }

  return '';
}

function serializeSlot(slot) {
  const populatedSubjectId =
    slot.subjectId &&
    typeof slot.subjectId === 'object' &&
    '_id' in slot.subjectId
      ? slot.subjectId._id
      : slot.subjectId;

  return {
    ...slot,
    subjectId: stringifyId(populatedSubjectId),
    subjectName: getSlotSubjectName(slot),
  };
}

export function serializeTimetableEntries(entries) {
  return Array.isArray(entries)
    ? entries.map((entry) => ({
        ...entry,
        _id: stringifyId(entry._id),
        userId: stringifyId(entry.userId),
        slots: Array.isArray(entry.slots)
          ? entry.slots.map((slot) => serializeSlot(slot))
          : [],
      }))
    : [];
}

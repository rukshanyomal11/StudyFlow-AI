export const MATERIAL_TYPES = ['Notes', 'PDFs', 'Videos', 'Assignments'];
export const MATERIAL_VISIBILITY = [
  'Assigned Students',
  'All Assigned Cohorts',
  'Private Draft',
];

const MATERIAL_TYPE_SET = new Set(MATERIAL_TYPES);
const MATERIAL_VISIBILITY_SET = new Set(MATERIAL_VISIBILITY);

export function normalizeMaterialType(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return MATERIAL_TYPE_SET.has(trimmedValue) ? trimmedValue : null;
}

export function normalizeMaterialVisibility(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return MATERIAL_VISIBILITY_SET.has(trimmedValue) ? trimmedValue : null;
}

export function normalizeSubjectKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function extractObjectId(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    if (typeof value._id === 'string') {
      return value._id;
    }

    if (value._id && typeof value._id.toString === 'function') {
      return value._id.toString();
    }

    if (typeof value.id === 'string') {
      return value.id;
    }

    if (value.id && typeof value.id.toString === 'function') {
      return value.id.toString();
    }
  }

  if (typeof value.toString === 'function') {
    const stringValue = value.toString();
    return stringValue === '[object Object]' ? '' : stringValue;
  }

  return '';
}

export function getMaterialSubjectName(material) {
  if (typeof material?.subjectName === 'string' && material.subjectName.trim()) {
    return material.subjectName.trim();
  }

  if (
    material?.subjectId &&
    typeof material.subjectId === 'object' &&
    typeof material.subjectId.name === 'string'
  ) {
    return material.subjectId.name.trim();
  }

  return '';
}

export function getMaterialMentorName(material) {
  if (typeof material?.mentorName === 'string' && material.mentorName.trim()) {
    return material.mentorName.trim();
  }

  if (
    material?.mentorId &&
    typeof material.mentorId === 'object' &&
    typeof material.mentorId.name === 'string'
  ) {
    return material.mentorId.name.trim();
  }

  return '';
}

export function serializeMaterial(material) {
  const id = extractObjectId(material?._id || material?.id);
  const subjectId = extractObjectId(material?.subjectId);
  const mentorId = extractObjectId(material?.mentorId);
  const visibility =
    normalizeMaterialVisibility(material?.visibility) || 'Assigned Students';
  const status =
    typeof material?.status === 'string' && ['Published', 'Draft', 'Archived'].includes(material.status)
      ? material.status
      : visibility === 'Private Draft'
        ? 'Draft'
        : 'Published';

  return {
    _id: id,
    id,
    mentorId,
    mentorName: getMaterialMentorName(material),
    title: typeof material?.title === 'string' ? material.title.trim() : '',
    subjectId,
    subjectName: getMaterialSubjectName(material),
    type: normalizeMaterialType(material?.type) || 'Notes',
    description:
      typeof material?.description === 'string' ? material.description.trim() : '',
    fileUrl: typeof material?.fileUrl === 'string' ? material.fileUrl.trim() : '',
    visibility,
    status,
    createdAt: material?.createdAt || null,
    updatedAt: material?.updatedAt || null,
  };
}

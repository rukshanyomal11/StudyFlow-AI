export const ANNOUNCEMENT_AUDIENCE_TYPES = [
  'all_assigned_students',
  'students',
  'groups',
];

export const ANNOUNCEMENT_STATUSES = ['Draft', 'Scheduled', 'Sent'];

const AUDIENCE_TYPE_SET = new Set(ANNOUNCEMENT_AUDIENCE_TYPES);
const STATUS_SET = new Set(ANNOUNCEMENT_STATUSES);

export function normalizeAnnouncementAudienceType(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return AUDIENCE_TYPE_SET.has(trimmedValue) ? trimmedValue : null;
}

export function normalizeAnnouncementStatus(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return STATUS_SET.has(trimmedValue) ? trimmedValue : null;
}

export function normalizeAnnouncementKey(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeAnnouncementTargetIds(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Target IDs must be an array of strings');
  }

  const targetIds = value
    .filter((targetId) => typeof targetId === 'string')
    .map((targetId) => targetId.trim())
    .filter(Boolean);

  if (targetIds.length !== value.length) {
    throw new Error('Target IDs must be an array of strings');
  }

  return [...new Set(targetIds)];
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

export function getAnnouncementMentorName(announcement) {
  if (
    announcement?.mentorId &&
    typeof announcement.mentorId === 'object' &&
    typeof announcement.mentorId.name === 'string'
  ) {
    return announcement.mentorId.name.trim();
  }

  if (
    typeof announcement?.mentorName === 'string' &&
    announcement.mentorName.trim()
  ) {
    return announcement.mentorName.trim();
  }

  return '';
}

export function getAnnouncementDeliveryAt(announcement) {
  if (announcement?.scheduledAt) {
    return announcement.scheduledAt;
  }

  return announcement?.createdAt || null;
}

export function isAnnouncementPublished(announcement, now = new Date()) {
  const status = normalizeAnnouncementStatus(announcement?.status);

  if (status === 'Sent') {
    return true;
  }

  if (status !== 'Scheduled') {
    return false;
  }

  const scheduledAt = announcement?.scheduledAt
    ? new Date(announcement.scheduledAt)
    : null;

  return Boolean(scheduledAt && !Number.isNaN(scheduledAt.getTime()) && scheduledAt <= now);
}

export function serializeAnnouncement(announcement) {
  const id = extractObjectId(announcement?._id || announcement?.id);
  const mentorId = extractObjectId(announcement?.mentorId);

  return {
    _id: id,
    id,
    mentorId,
    mentorName: getAnnouncementMentorName(announcement),
    title: typeof announcement?.title === 'string' ? announcement.title.trim() : '',
    message:
      typeof announcement?.message === 'string' ? announcement.message.trim() : '',
    audienceType:
      normalizeAnnouncementAudienceType(announcement?.audienceType) ||
      'all_assigned_students',
    targetIds: normalizeAnnouncementTargetIds(announcement?.targetIds || []),
    scheduledAt: announcement?.scheduledAt || null,
    deliveryAt: getAnnouncementDeliveryAt(announcement),
    status: normalizeAnnouncementStatus(announcement?.status) || 'Draft',
    createdAt: announcement?.createdAt || null,
    updatedAt: announcement?.updatedAt || null,
  };
}

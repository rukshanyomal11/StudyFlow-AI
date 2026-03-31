import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { requireAuth } from '@/lib/getSession';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedThemeModes = new Set(['Light', 'Dark', 'System']);
const allowedDashboardDensities = new Set([
  'Comfortable',
  'Compact',
  'Spacious',
]);
const allowedLanguages = new Set(['English', 'Sinhala', 'Tamil']);

function createErrorResponse(error) {
  console.error('Mentor settings API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'Only mentors can access mentor settings') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === 'Mentor not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message === 'Invalid JSON body' ||
      error.message === 'Request body must be a JSON object' ||
      error.message === 'At least one settings field is required' ||
      error.message === 'General settings must be a JSON object' ||
      error.message === 'Notification settings must be a JSON object' ||
      error.message === 'Teaching settings must be a JSON object' ||
      error.message === 'Security settings must be a JSON object' ||
      error.message === 'Appearance settings must be a JSON object' ||
      error.message === 'Display name is required' ||
      error.message === 'Email is required' ||
      error.message === 'Email must be valid' ||
      error.message === 'Email is already in use' ||
      error.message === 'Default teaching subject must be a string' ||
      error.message === 'Timezone must be a string' ||
      error.message === 'studentMessageAlerts must be a boolean' ||
      error.message === 'doubtAlerts must be a boolean' ||
      error.message === 'quizSubmissionAlerts must be a boolean' ||
      error.message === 'announcementReminders must be a boolean' ||
      error.message === 'allowStudentMessages must be a boolean' ||
      error.message === 'autoAssignMaterials must be a boolean' ||
      error.message === 'visibleOfficeHours must be a boolean' ||
      error.message === 'feedbackReminders must be a boolean' ||
      error.message === 'twoFactorAuth must be a boolean' ||
      error.message === 'Theme mode must be one of: Light, Dark, System' ||
      error.message ===
        'Dashboard density must be one of: Comfortable, Compact, Spacious' ||
      error.message === 'Language must be one of: English, Sinhala, Tamil'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}

function ensureMentor(user) {
  if (user.role !== 'mentor') {
    throw new Error('Only mentors can access mentor settings');
  }
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function ensureBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean`);
  }

  return value;
}

async function ensureUniqueEmail(email, userId) {
  const existingUser = await User.findOne({
    email,
    _id: { $ne: userId },
  })
    .select('_id')
    .lean();

  if (existingUser) {
    throw new Error('Email is already in use');
  }
}

function buildSettingsResponse(user) {
  const preferences = user.preferences || {};

  return {
    general: {
      displayName: user.name,
      email: user.email,
      defaultTeachingSubject: preferences.defaultTeachingSubject || '',
      timezone: preferences.timezone || 'Asia/Colombo (GMT+5:30)',
    },
    notifications: {
      studentMessageAlerts: preferences.studentMessageAlerts ?? true,
      doubtAlerts: preferences.doubtAlerts ?? true,
      quizSubmissionAlerts: preferences.quizSubmissionAlerts ?? true,
      announcementReminders: preferences.announcementReminders ?? false,
    },
    teaching: {
      allowStudentMessages: preferences.allowStudentMessages ?? true,
      autoAssignMaterials: preferences.autoAssignMaterials ?? false,
      visibleOfficeHours: preferences.visibleOfficeHours ?? true,
      feedbackReminders: preferences.feedbackReminders ?? true,
    },
    security: {
      twoFactorAuth: preferences.twoFactorAuth ?? false,
    },
    appearance: {
      themeMode: preferences.themeMode || 'System',
      dashboardDensity: preferences.dashboardDensity || 'Comfortable',
      language: preferences.language || 'English',
    },
  };
}

function buildUpdatePayload(body) {
  const source =
    isPlainObject(body?.settings) ? body.settings : body;

  if (!isPlainObject(source)) {
    throw new Error('Request body must be a JSON object');
  }

  const updates = {};

  if ('general' in source) {
    if (!isPlainObject(source.general)) {
      throw new Error('General settings must be a JSON object');
    }

    if ('displayName' in source.general) {
      const displayName =
        typeof source.general.displayName === 'string'
          ? source.general.displayName.trim()
          : '';

      if (!displayName) {
        throw new Error('Display name is required');
      }

      updates.name = displayName;
    }

    if ('email' in source.general) {
      const email =
        typeof source.general.email === 'string'
          ? source.general.email.trim().toLowerCase()
          : '';

      if (!email) {
        throw new Error('Email is required');
      }

      if (!emailPattern.test(email)) {
        throw new Error('Email must be valid');
      }

      updates.email = email;
    }

    if ('defaultTeachingSubject' in source.general) {
      if (
        source.general.defaultTeachingSubject !== null &&
        source.general.defaultTeachingSubject !== undefined &&
        typeof source.general.defaultTeachingSubject !== 'string'
      ) {
        throw new Error('Default teaching subject must be a string');
      }

      updates['preferences.defaultTeachingSubject'] =
        typeof source.general.defaultTeachingSubject === 'string'
          ? source.general.defaultTeachingSubject.trim()
          : '';
    }

    if ('timezone' in source.general) {
      if (typeof source.general.timezone !== 'string') {
        throw new Error('Timezone must be a string');
      }

      updates['preferences.timezone'] = source.general.timezone.trim();
    }
  }

  if ('notifications' in source) {
    if (!isPlainObject(source.notifications)) {
      throw new Error('Notification settings must be a JSON object');
    }

    if ('studentMessageAlerts' in source.notifications) {
      updates['preferences.studentMessageAlerts'] = ensureBoolean(
        source.notifications.studentMessageAlerts,
        'studentMessageAlerts',
      );
    }

    if ('doubtAlerts' in source.notifications) {
      updates['preferences.doubtAlerts'] = ensureBoolean(
        source.notifications.doubtAlerts,
        'doubtAlerts',
      );
    }

    if ('quizSubmissionAlerts' in source.notifications) {
      updates['preferences.quizSubmissionAlerts'] = ensureBoolean(
        source.notifications.quizSubmissionAlerts,
        'quizSubmissionAlerts',
      );
    }

    if ('announcementReminders' in source.notifications) {
      updates['preferences.announcementReminders'] = ensureBoolean(
        source.notifications.announcementReminders,
        'announcementReminders',
      );
    }
  }

  if ('teaching' in source) {
    if (!isPlainObject(source.teaching)) {
      throw new Error('Teaching settings must be a JSON object');
    }

    if ('allowStudentMessages' in source.teaching) {
      updates['preferences.allowStudentMessages'] = ensureBoolean(
        source.teaching.allowStudentMessages,
        'allowStudentMessages',
      );
    }

    if ('autoAssignMaterials' in source.teaching) {
      updates['preferences.autoAssignMaterials'] = ensureBoolean(
        source.teaching.autoAssignMaterials,
        'autoAssignMaterials',
      );
    }

    if ('visibleOfficeHours' in source.teaching) {
      updates['preferences.visibleOfficeHours'] = ensureBoolean(
        source.teaching.visibleOfficeHours,
        'visibleOfficeHours',
      );
    }

    if ('feedbackReminders' in source.teaching) {
      updates['preferences.feedbackReminders'] = ensureBoolean(
        source.teaching.feedbackReminders,
        'feedbackReminders',
      );
    }
  }

  if ('security' in source) {
    if (!isPlainObject(source.security)) {
      throw new Error('Security settings must be a JSON object');
    }

    if ('twoFactorAuth' in source.security) {
      updates['preferences.twoFactorAuth'] = ensureBoolean(
        source.security.twoFactorAuth,
        'twoFactorAuth',
      );
    }
  }

  if ('appearance' in source) {
    if (!isPlainObject(source.appearance)) {
      throw new Error('Appearance settings must be a JSON object');
    }

    if ('themeMode' in source.appearance) {
      const themeMode =
        typeof source.appearance.themeMode === 'string'
          ? source.appearance.themeMode.trim()
          : '';

      if (!allowedThemeModes.has(themeMode)) {
        throw new Error('Theme mode must be one of: Light, Dark, System');
      }

      updates['preferences.themeMode'] = themeMode;
    }

    if ('dashboardDensity' in source.appearance) {
      const dashboardDensity =
        typeof source.appearance.dashboardDensity === 'string'
          ? source.appearance.dashboardDensity.trim()
          : '';

      if (!allowedDashboardDensities.has(dashboardDensity)) {
        throw new Error(
          'Dashboard density must be one of: Comfortable, Compact, Spacious',
        );
      }

      updates['preferences.dashboardDensity'] = dashboardDensity;
    }

    if ('language' in source.appearance) {
      const language =
        typeof source.appearance.language === 'string'
          ? source.appearance.language.trim()
          : '';

      if (!allowedLanguages.has(language)) {
        throw new Error('Language must be one of: English, Sinhala, Tamil');
      }

      updates['preferences.language'] = language;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('At least one settings field is required');
  }

  return updates;
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    ensureMentor(currentUser);

    await connectDB();

    const mentor = await User.findById(currentUser.id).lean();

    if (!mentor || mentor.role !== 'mentor') {
      throw new Error('Mentor not found');
    }

    return NextResponse.json(
      {
        settings: buildSettingsResponse(mentor),
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const currentUser = await requireAuth();
    ensureMentor(currentUser);

    await connectDB();

    const body = await readJsonBody(request);
    const updates = buildUpdatePayload(body);

    if (updates.email) {
      await ensureUniqueEmail(updates.email, currentUser.id);
    }

    const mentor = await User.findByIdAndUpdate(
      currentUser.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!mentor || mentor.role !== 'mentor') {
      throw new Error('Mentor not found');
    }

    return NextResponse.json(
      {
        message: 'Mentor settings updated successfully',
        settings: buildSettingsResponse(mentor),
      },
      { status: 200 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

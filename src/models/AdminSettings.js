import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
      required: true,
      trim: true,
    },
    general: {
      appName: {
        type: String,
        default: 'StudyFlow AI',
        trim: true,
      },
      supportEmail: {
        type: String,
        default: 'support@studyflow.ai',
        trim: true,
      },
      platformDescription: {
        type: String,
        default:
          'A smart study planner and AI study coach that helps learners stay consistent, organized, and ahead of every deadline.',
        trim: true,
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
    },
    permissions: {
      adminUserManagement: {
        type: Boolean,
        default: true,
      },
      adminBillingControls: {
        type: Boolean,
        default: true,
      },
      adminModerationTools: {
        type: Boolean,
        default: true,
      },
      mentorStudentInsights: {
        type: Boolean,
        default: true,
      },
      mentorQuizPublishing: {
        type: Boolean,
        default: true,
      },
      mentorSessionScheduling: {
        type: Boolean,
        default: true,
      },
      studentAiCoach: {
        type: Boolean,
        default: true,
      },
      studentDownloads: {
        type: Boolean,
        default: true,
      },
      studentCommunityAccess: {
        type: Boolean,
        default: false,
      },
    },
    notifications: {
      emailAlerts: {
        type: Boolean,
        default: true,
      },
      pushAlerts: {
        type: Boolean,
        default: true,
      },
      reportNotifications: {
        type: Boolean,
        default: true,
      },
      billingAlerts: {
        type: Boolean,
        default: true,
      },
    },
    security: {
      sessionTimeout: {
        type: String,
        enum: ['15 minutes', '30 minutes', '1 hour', '4 hours'],
        default: '30 minutes',
      },
      passwordPolicy: {
        type: String,
        enum: ['Balanced', 'Strong', 'Strict'],
        default: 'Strong',
      },
      enforceTwoFactor: {
        type: Boolean,
        default: true,
      },
      loginAlerts: {
        type: Boolean,
        default: true,
      },
    },
    platform: {
      aiRecommendations: {
        type: Boolean,
        default: true,
      },
      quizzes: {
        type: Boolean,
        default: true,
      },
      mentorTools: {
        type: Boolean,
        default: true,
      },
      subscriptions: {
        type: Boolean,
        default: true,
      },
    },
    appearance: {
      themeMode: {
        type: String,
        enum: ['Light', 'Dark', 'System'],
        default: 'System',
      },
      brandColor: {
        type: String,
        enum: ['Ocean Blue', 'Emerald', 'Slate', 'Amber'],
        default: 'Ocean Blue',
      },
      dashboardDensity: {
        type: String,
        enum: ['Comfortable', 'Compact', 'Spacious'],
        default: 'Comfortable',
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const AdminSettings =
  mongoose.models.AdminSettings ||
  mongoose.model('AdminSettings', adminSettingsSchema);

export default AdminSettings;

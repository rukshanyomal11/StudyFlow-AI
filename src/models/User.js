import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    qualification: {
      type: String,
      default: '',
      trim: true,
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
    },
    specialization: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    subjectExpertise: [
      {
        type: String,
        trim: true,
      },
    ],
    level: {
      type: String,
      default: null,
    },
    goals: [
      {
        type: String,
      },
    ],
    preferences: {
      studyHoursPerDay: {
        type: Number,
        default: 4,
      },
      preferredTime: {
        type: String,
        default: 'morning',
      },
      reminderEnabled: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: 'Asia/Colombo (GMT+5:30)',
      },
      language: {
        type: String,
        enum: ['English', 'Sinhala', 'Tamil'],
        default: 'English',
      },
      themeMode: {
        type: String,
        enum: ['Light', 'Dark', 'System'],
        default: 'System',
      },
      dashboardDensity: {
        type: String,
        enum: ['Comfortable', 'Compact', 'Spacious'],
        default: 'Comfortable',
      },
      defaultTeachingSubject: {
        type: String,
        default: '',
      },
      studentMessageAlerts: {
        type: Boolean,
        default: true,
      },
      doubtAlerts: {
        type: Boolean,
        default: true,
      },
      quizSubmissionAlerts: {
        type: Boolean,
        default: true,
      },
      announcementReminders: {
        type: Boolean,
        default: false,
      },
      allowStudentMessages: {
        type: Boolean,
        default: true,
      },
      autoAssignMaterials: {
        type: Boolean,
        default: false,
      },
      visibleOfficeHours: {
        type: Boolean,
        default: true,
      },
      feedbackReminders: {
        type: Boolean,
        default: true,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'mentor'],
      default: 'free',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

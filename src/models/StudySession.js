import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    goal: {
      type: String,
      trim: true,
      default: '',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    focusScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    distractions: {
      type: Number,
      default: 0,
      min: [0, 'Distractions cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ subjectId: 1 });
studySessionSchema.index({ taskId: 1 });

if (process.env.NODE_ENV === 'development' && mongoose.models.StudySession) {
  delete mongoose.models.StudySession;
}

const StudySession = mongoose.models.StudySession || mongoose.model('StudySession', studySessionSchema);

export default StudySession;

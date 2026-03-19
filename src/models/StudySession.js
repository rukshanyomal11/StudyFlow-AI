import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    focusScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    distractions: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    pausedDuration: {
      type: Number, // in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ subjectId: 1 });

const StudySession = mongoose.models.StudySession || mongoose.model('StudySession', studySessionSchema);

export default StudySession;

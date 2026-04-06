import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    categoryId: {
      type: String,
      default: 'general',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Draft'],
      default: 'Active',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    mentors: [
      {
        type: String,
        trim: true,
      },
    ],
    enrolledStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizzes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

subjectSchema.index({ userId: 1, createdAt: -1 });

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

export default Subject;

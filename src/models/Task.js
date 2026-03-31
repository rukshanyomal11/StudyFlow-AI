import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Task date is required'],
    },
    duration: {
      type: Number,
      default: 60,
      min: [0, 'Duration cannot be negative'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'missed'],
      default: 'pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, subjectId: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;

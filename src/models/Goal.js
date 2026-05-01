import mongoose from 'mongoose';

const goalTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Goal task title is required'],
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: false,
  },
);

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    target: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    timeframe: {
      type: String,
      enum: ['short_term', 'long_term'],
      default: 'short_term',
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Goal deadline is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      required: true,
    },
    tasks: {
      type: [goalTaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

goalSchema.index({ userId: 1, deadline: 1 });
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, timeframe: 1 });

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

export default Goal;

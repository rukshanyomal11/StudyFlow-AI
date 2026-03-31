import mongoose from 'mongoose';

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
  },
  {
    timestamps: true,
  },
);

goalSchema.index({ userId: 1, deadline: 1 });
goalSchema.index({ userId: 1, status: 1 });

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

export default Goal;

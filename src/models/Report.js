import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter ID is required'],
    },
    type: {
      type: String,
      enum: ['Community', 'Content', 'Billing', 'Safety', 'Academic'],
      required: [true, 'Report type is required'],
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
    },
    targetId: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Investigating', 'Resolved', 'Dismissed'],
      default: 'Pending',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      required: true,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ reportedBy: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ type: 1, createdAt: -1 });

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;

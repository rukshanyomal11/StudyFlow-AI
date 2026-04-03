import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor ID is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Doubt title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Doubt message is required'],
      trim: true,
    },
    reply: {
      type: String,
      default: '',
      trim: true,
    },
    replyAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewing', 'Answered'],
      default: 'Pending',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Urgent', 'High', 'Normal'],
      default: 'Normal',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

doubtSchema.index({ mentorId: 1, status: 1, createdAt: -1 });
doubtSchema.index({ studentId: 1, createdAt: -1 });
doubtSchema.index({ subjectId: 1, createdAt: -1 });

const Doubt = mongoose.models.Doubt || mongoose.model('Doubt', doubtSchema);

export default Doubt;

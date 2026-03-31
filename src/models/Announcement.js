import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      trim: true,
    },
    audienceType: {
      type: String,
      enum: ['all_assigned_students', 'students', 'groups'],
      required: [true, 'Audience type is required'],
    },
    targetIds: [
      {
        type: String,
        trim: true,
      },
    ],
    scheduledAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Sent'],
      default: 'Draft',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

announcementSchema.index({ mentorId: 1, createdAt: -1 });
announcementSchema.index({ mentorId: 1, status: 1 });
announcementSchema.index({ audienceType: 1 });

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model('Announcement', announcementSchema);

export default Announcement;

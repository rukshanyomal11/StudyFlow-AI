import mongoose from 'mongoose';

const timetableSlotSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Slot title is required'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    day: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: [true, 'Day is required'],
    },
    slots: {
      type: [timetableSlotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

timetableSchema.index({ userId: 1, day: 1 }, { unique: true });

const Timetable =
  mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);

export default Timetable;

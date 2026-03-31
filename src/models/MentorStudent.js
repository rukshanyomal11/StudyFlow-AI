import mongoose from 'mongoose';

const mentorStudentSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor ID is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

mentorStudentSchema.index(
  { mentorId: 1, studentId: 1, subjectId: 1 },
  { unique: true },
);
mentorStudentSchema.index({ mentorId: 1, createdAt: -1 });
mentorStudentSchema.index({ studentId: 1, createdAt: -1 });

const MentorStudent =
  mongoose.models.MentorStudent ||
  mongoose.model('MentorStudent', mentorStudentSchema);

export default MentorStudent;

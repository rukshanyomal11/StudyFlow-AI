import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    type: {
      type: String,
      enum: ['Notes', 'PDFs', 'Videos', 'Assignments'],
      required: [true, 'Material type is required'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['Assigned Students', 'All Assigned Cohorts', 'Private Draft'],
      default: 'Assigned Students',
      required: [true, 'Visibility is required'],
    },
  },
  {
    timestamps: true,
  },
);

materialSchema.index({ mentorId: 1, createdAt: -1 });
materialSchema.index({ subjectId: 1, createdAt: -1 });
materialSchema.index({ visibility: 1 });

const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);

export default Material;

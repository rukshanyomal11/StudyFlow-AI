import mongoose from 'mongoose';

const adminSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Draft'],
      default: 'Active',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

adminSubjectSchema.index({ name: 1 }, { unique: true });
adminSubjectSchema.index({ category: 1, status: 1 });
adminSubjectSchema.index({ createdAt: -1 });

const AdminSubject =
  mongoose.models.AdminSubject ||
  mongoose.model('AdminSubject', adminSubjectSchema);

export default AdminSubject;

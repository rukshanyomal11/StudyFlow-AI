import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    plan: {
      type: String,
      enum: ['Free', 'Pro', 'Mentor Pro'],
      required: [true, 'Plan is required'],
      default: 'Free',
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Yearly'],
      required: [true, 'Billing cycle is required'],
      default: 'Monthly',
    },
    status: {
      type: String,
      enum: ['Paid', 'Overdue', 'Trialing', 'Canceled'],
      required: [true, 'Subscription status is required'],
      default: 'Trialing',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.index({ userId: 1, createdAt: -1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });
subscriptionSchema.index({ plan: 1, billingCycle: 1 });

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

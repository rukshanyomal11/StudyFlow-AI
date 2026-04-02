import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [
        {
          type: String,
          trim: true,
          required: true,
        },
      ],
      validate: {
        validator(options) {
          return Array.isArray(options) && options.length >= 2;
        },
        message: 'Each question must have at least two options',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer is required'],
      min: 0,
      validate: {
        validator(correctAnswer) {
          return Number.isInteger(correctAnswer) && correctAnswer < this.options.length;
        },
        message: 'Correct answer must match one of the option indexes',
      },
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const quizSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    assignedTo: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    questions: {
      type: [quizQuestionSchema],
      validate: {
        validator(questions) {
          return Array.isArray(questions) && questions.length > 0;
        },
        message: 'Quiz must include at least one question',
      },
      required: [true, 'Quiz questions are required'],
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ subjectId: 1 });
quizSchema.index({ assignedTo: 1, createdAt: -1 });

if (process.env.NODE_ENV === 'development' && mongoose.models.Quiz) {
  delete mongoose.models.Quiz;
}

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;

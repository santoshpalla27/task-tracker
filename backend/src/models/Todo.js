const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Todo text is required'],
      trim: true,
      maxlength: [200, 'Text cannot exceed 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
todoSchema.index({ completed: 1, createdAt: -1 });

module.exports = mongoose.model('Todo', todoSchema);
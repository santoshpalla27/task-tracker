const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'shopping', 'health', 'other'],
    default: 'personal'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
todoSchema.index({ assignee: 1, completed: 1 });
todoSchema.index({ createdAt: -1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ category: 1 });

// Method to toggle completion status
todoSchema.methods.toggleCompletion = function() {
  this.completed = !this.completed;
  this.completedAt = this.completed ? new Date() : null;
  return this.save();
};

// Method to mark as completed
todoSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to mark as incomplete
todoSchema.methods.markAsIncomplete = function() {
  this.completed = false;
  this.completedAt = null;
  return this.save();
};

module.exports = mongoose.model('Todo', todoSchema);

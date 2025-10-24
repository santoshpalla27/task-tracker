const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['backlog', 'in-progress', 'in-review', 'done'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0,
    max: 1000
  },
  actualHours: {
    type: Number,
    min: 0,
    max: 1000,
    default: 0
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ tags: 1 });

// Virtual for completion status
taskSchema.virtual('isCompleted').get(function() {
  return this.status === 'done';
});

// Method to update completion date
taskSchema.methods.markAsCompleted = function() {
  this.status = 'done';
  this.completedAt = new Date();
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(text, authorId) {
  this.comments.push({
    text,
    author: authorId
  });
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);

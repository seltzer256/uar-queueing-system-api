const mongoose = require('mongoose');

const planRowSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan  must have an template'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  cells: [
    {
      parentSlug: {
        type: String,
        required: [true, 'Cell must have a parent'],
      },
      content: { type: String },
    },
  ],
});

const PlanRow = mongoose.model('PlanRow', planRowSchema);

module.exports = PlanRow;

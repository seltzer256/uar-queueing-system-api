const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    // required: true,
  },
  module: {
    type: mongoose.Schema.ObjectId,
    ref: 'Module',
    // required: true,
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startDate: Date,
  endDate: Date,
  state: {
    type: String,
    enum: ['in-progress', 'on-hold', 'completed', 'cancelled', 'pending'],
    default: 'on-hold',
  },
  observation: String,
});

shiftSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'module',
    select: 'name code -services ',
  }).select('-module.user');
  // .find({ active: true });
  next();
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;

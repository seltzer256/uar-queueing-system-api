const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    // required: true,
  },
  module: {
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Module',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  code: String,
  date: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  state: {
    type: String,
    required: true,
    enum: ['in-progress', 'on-hold', 'completed', 'cancelled', 'pending'],
  },
  observation: String,
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;

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
      required: true,
    },
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
    path: 'module._id',
    select: 'name -service -user',
  }).select('-module.user');
  // .find({ active: true });
  next();
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;

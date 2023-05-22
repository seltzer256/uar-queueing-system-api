const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    // required: true,
  },
  module: {
    type: mongoose.Schema.ObjectId,
    ref: 'Module',
    required: true,
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
    enum: ['pending', 'approved', 'rejected'],
  },
  observation: String,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true,
  },
  code: String,
  name: String,
  //   options: [String],
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;

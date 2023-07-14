const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  services: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Service',
      required: true,
    },
  ],
  code: String,
  name: String,
  active: {
    type: Boolean,
    default: true,
  },
});

moduleSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name isAvailable',
  }).populate({
    path: 'service',
    select: 'name description active',
  });
  // .find({ active: true });
  next();
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;

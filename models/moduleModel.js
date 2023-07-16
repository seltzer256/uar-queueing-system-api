const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  code: String,
  name: String,
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
  active: {
    type: Boolean,
    default: true,
  },
});

moduleSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name active',
  }).populate({
    path: 'services',
    select: 'name active',
  });
  // .find({ active: true });
  next();
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;

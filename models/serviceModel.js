const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Plan must have a slug'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Plan must have a name!'],
  },
  description: {
    type: String,
    required: [true, 'Plan must have a description'],
    minLength: [10, 'Description must be at least 10 characters long'],
    maxLength: [1000, 'Description must be at most 1000 characters long'],
  },
  image: String,
  active: {
    type: Boolean,
    default: true,
  },
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

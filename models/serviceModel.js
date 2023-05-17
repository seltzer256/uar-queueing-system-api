const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const serviceSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
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
  active: {
    type: Boolean,
    default: true,
  },
});

serviceSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const serviceSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Service must have a name!'],
  },
  code: {
    type: String,
    required: [true, 'Service must have a code!'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  chooseRequired: {
    type: Boolean,
    default: false,
  },
  authRequired: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: [true, 'Service must have a description'],
    minLength: [10, 'Description must be at least 10 characters long'],
    maxLength: [1000, 'Description must be at most 1000 characters long'],
  },
});

serviceSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

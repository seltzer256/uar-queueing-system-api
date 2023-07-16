const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: String,
  lastName: String,
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

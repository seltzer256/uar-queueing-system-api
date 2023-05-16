const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  documentId: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

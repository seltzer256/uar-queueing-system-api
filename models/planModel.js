const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan must have a name!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateLogs: [
    {
      date: Date,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    },
  ],
  schema: [
    {
      label: {
        type: String,
        required: [true, 'Schema field must have a name'],
      },
      slug: String,
      type: {
        type: String,
        enum: ['String', 'Number', 'Boolean'],
        default: 'String',
      },
      required: Boolean,
      instructions: String,
    },
  ],
  // relevantDocs: {
  //   maxDocs: {
  //     type: Number,
  //     default: 1,
  //   },
  //   docsLinks: [
  //     {
  //       type: String,
  //     },
  //   ],
  // },
  relevantDocs: [String],
  assignedTo: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Plan must have an user assigned'],
    },
  ],
  deadline: {
    type: Date,
    // required: [true, "Plan must have a deadline"]
  },
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;

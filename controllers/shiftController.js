const Shift = require('../models/shiftModel');
const factory = require('./handlerFactory');

exports.getAllShifts = factory.getAll(Shift);

exports.getShift = factory.getOne(Shift);

exports.createShift = factory.createOne(Shift);

exports.deleteShift = factory.deleteOne(Shift);

exports.updateShift = factory.updateOne(Shift);

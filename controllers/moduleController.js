const Module = require('../models/moduleModel');
const factory = require('./handlerFactory');

exports.getAllModules = factory.getAll(Module);

exports.getModule = factory.getOne(Module);

exports.createModule = factory.createOne(Module);

exports.deleteModule = factory.deleteOne(Module);

exports.updateModule = factory.updateOne(Module);

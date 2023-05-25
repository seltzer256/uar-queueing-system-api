const Module = require('../models/moduleModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllModules = factory.getAll(Module);

exports.getActiveModules = catchAsync(async (req, res, next) => {
  const modules = await Module.find({ active: true });
  res.status(200).json({
    status: 'success',
    results: modules.length,
    data: { modules },
  });
});

exports.getModule = factory.getOne(Module);

exports.createModule = factory.createOne(Module);

exports.deleteModule = factory.deleteOne(Module);

exports.updateModule = factory.updateOne(Module);

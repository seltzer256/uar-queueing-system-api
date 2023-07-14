const Service = require('../models/serviceModel');
const factory = require('./handlerFactory');

exports.getAllServices = factory.getAll(Service);

exports.getActiveServices = catchAsync(async (req, res, next) => {
  const services = await Service.find({ active: true });
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: { services },
  });
});

exports.getService = factory.getOne(Service);

exports.createService = factory.createOne(Service);

exports.deleteService = factory.deleteOne(Service);

exports.updateService = factory.updateOne(Service);

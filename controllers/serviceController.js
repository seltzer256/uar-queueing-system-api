const Service = require('../models/serviceModel');
const factory = require('./handlerFactory');

exports.getAllServices = factory.getAll(Service);

exports.getActiveServices = catchAsync(async (req, res, next) => {
  // const services = await Service.find({ active: true });
  const services = await Service.aggregate([
    {
      $match: {
        active: true,
      },
    },
    {
      $lookup: {
        from: 'modules',
        localField: '_id',
        foreignField: 'services',
        as: 'module',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'module.user',
        foreignField: '_id',
        as: 'users',
      },
    },
    {
      $project: {
        module: 0,
        users: {
          password: 0,
          __v: 0,
          role: 0,
        },
      },
    },
  ]);

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

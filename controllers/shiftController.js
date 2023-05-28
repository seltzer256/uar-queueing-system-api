const Client = require('../models/clientModel');
const Module = require('../models/moduleModel');
const Shift = require('../models/shiftModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

exports.getAllShifts = factory.getAll(Shift);

exports.getShift = factory.getOne(Shift);

exports.createShift = catchAsync(async (req, res, next) => {
  const { moduleId, clientId, moduleUser } = req.body;

  const module = await Module.findById(moduleId);

  const authRequired = module.authRequired;

  let client = null;

  if (authRequired && clientId) {
    client = await Client.findOne({
      documentId: clientId,
    });
    if (!client) {
      //
      //TODO: get client data from ESPE Api
      //
      client = await Client.create({
        documentId: clientId,
      });
    }
  }

  if (authRequired && !clientId) {
    return res.status(401).json({
      status: 'error',
      message: 'Client document Id is required',
    });
  }

  const isCorrectUser = module.user.find(
    (user) => user._id.toString() === moduleUser
  );

  if (!isCorrectUser) {
    return res.status(401).json({
      status: 'error',
      message: 'Module user not found',
    });
  }

  const startOfDay = dayjs()
    .startOf('day')
    .utc()
    .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

  // console.log('startOfDay :>> ', startOfDay);

  const todayShifts = await Shift.find({
    'module._id': module._id,
    date: {
      $gte: startOfDay,
    },
  });

  const code = `${module.code}-${todayShifts.length + 1}`;

  const shift = await Shift.create({
    client: client?._id,
    module: {
      _id: module._id,
      user: moduleUser,
    },
    date: new Date(),
    code,
  });

  res.status(200).json({
    status: 'success',
    shift,
    todayShifts,
  });
});

exports.getShiftsByUser = catchAsync(async (req, res, next) => {
  const user = req.params.user;

  const shifts = await Shift.find({
    'module.user': user,
  }).select('-module');

  res.status(200).json({
    status: 'success',
    shifts,
  });
});

exports.changeState = catchAsync(async (req, res, next) => {
  const { id, state, observation } = req.body;

  if (!state || !id)
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data',
    });

  let newData = {};

  switch (state) {
    case 'in-progress':
      newData = {
        state: 'in-progress',
        startDate: new Date(),
      };
      break;
    case 'completed':
      newData = {
        state: 'completed',
        endDate: new Date(),
      };
      break;
    case 'cancelled':
      newData = {
        state: 'cancelled',
        endDate: new Date(),
        observation,
      };
      break;
    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid state',
      });
  }

  const shift = await Shift.findByIdAndUpdate(id, newData, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    shift,
  });
});

exports.deleteShift = factory.deleteOne(Shift);

exports.updateShift = factory.updateOne(Shift);

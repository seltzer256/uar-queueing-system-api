const Client = require('../models/clientModel');
const Module = require('../models/moduleModel');
const Shift = require('../models/shiftModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { mongooseDateFormat } = require('../utils/utils');
const { default: mongoose } = require('mongoose');
dayjs.extend(utc);
let io;

exports.setShiftControllerIO = (socketIO) => {
  io = socketIO;
};

exports.getTodayShifts = catchAsync(async (req, res, next) => {
  const todayShifts = await Shift.find({
    state: { $in: ['in-progress', 'on-hold'] },
    date: {
      $gte: dayjs().startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    },
  }).sort({ state: 1, date: 1 });

  res.status(200).json({
    status: 'success',
    results: todayShifts.length,
    data: todayShifts,
  });
});

exports.getTodayShiftsByUsers = catchAsync(async (req, res, next) => {
  const { date, module } = req.query;

  if (!date || !dayjs(date).isValid()) {
    return res.status(400).json({
      status: 'error',
      message: 'Date is required',
    });
  }

  let matchQuery = {
    state: { $in: ['completed', 'cancelled'] },
    date: {
      $gte: new Date(date),
      $lte: new Date(date + ' 23:59:59'),
    },
  };

  if (module) {
    matchQuery = {
      ...matchQuery,
      'module._id': new mongoose.Types.ObjectId(module),
    };
  }

  const todayShifts = await Shift.aggregate([
    {
      $match: matchQuery,
    },
    {
      $project: {
        _id: '$module.user',
        completed: {
          $cond: [
            {
              $eq: ['$state', 'completed'],
            },
            1,
            0,
          ],
        },
        cancelled: {
          $cond: [
            {
              $eq: ['$state', 'cancelled'],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        completedCount: {
          $sum: '$completed',
        },
        cancelledCount: {
          $sum: '$cancelled',
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $sort: {
        completedCount: -1,
      },
    },
    {
      $project: {
        _id: 0,
        completedCount: 1,
        cancelledCount: 1,
        user: '$user.name',
      },
    },
    {
      $unwind: '$user',
    },
  ]);

  res.status(200).json({
    status: 'success',
    // results: todayShifts.length,
    data: todayShifts,
  });
});

exports.attendingAverage = catchAsync(async (req, res, next) => {
  const { date, module } = req.query;

  if (!date || !dayjs(date).isValid()) {
    return res.status(400).json({
      status: 'error',
      message: 'Date is required',
    });
  }

  let matchQuery = {
    state: { $in: ['completed', 'cancelled'] },
    date: {
      $gte: new Date(date),
      $lte: new Date(date + ' 23:59:59'),
    },
  };

  if (module) {
    matchQuery = {
      ...matchQuery,
      'module._id': new mongoose.Types.ObjectId(module),
    };
  }

  const average = await Shift.aggregate([
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: 'users',
        localField: 'module.user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        user: '$user.name',
        attendingTime: {
          $subtract: ['$endDate', '$startDate'],
        },
      },
    },
    {
      $group: {
        _id: '$user',
        attendingAverage: {
          $avg: '$attendingTime',
        },
      },
    },
    {
      $project: {
        _id: 0,
        user: '$_id',
        attendingAverage: {
          $divide: ['$attendingAverage', 60 * 1000],
        },
      },
    },
    {
      $sort: {
        attendingAverage: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    // results: todayShifts.length,
    data: average,
  });
});

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

  io.emit('shiftCreated', moduleUser);

  res.status(200).json({
    status: 'success',
    shift,
    // todayShifts,
  });
});

exports.getShiftsByUser = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  const onlyToday = req.query.onlyToday;
  // console.log('user :>> ', user);
  // console.log('onlyToday :>> ', onlyToday);
  const query = {
    'module.user': user,
  };

  if (onlyToday) {
    query.date = {
      $gte: dayjs().startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    };
  }

  const shifts = await Shift.find(query)
    .populate({
      path: 'module._id',
      select: 'name active -service -user',
    })
    .select('-module.user');

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

  io.emit('shiftUpdated', shift);

  res.status(200).json({
    status: 'success',
    shift,
  });
});

exports.deleteShift = factory.deleteOne(Shift);

exports.updateShift = factory.updateOne(Shift);

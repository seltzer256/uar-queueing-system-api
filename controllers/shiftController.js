const Client = require('../models/clientModel');
const Module = require('../models/moduleModel');
const Shift = require('../models/shiftModel');
const Service = require('../models/serviceModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { default: mongoose } = require('mongoose');
const sendEmail = require('../utils/email');
const { SHIFT_EMAIL } = require('../utils/emails/shift-email');
dayjs.extend(utc);
let io;

exports.setShiftControllerIO = (socketIO) => {
  io = socketIO;
};

exports.getTodayShifts = catchAsync(async (req, res, next) => {
  const todayShifts = await Shift.find({
    state: { $in: ['in-progress'] },
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
  const { date, service } = req.query;

  let matchQuery = {
    state: { $in: ['completed', 'cancelled'] },
  };

  if (dayjs(date).isValid()) {
    matchQuery = {
      ...matchQuery,
      date: {
        $gte: new Date(date),
        $lte: new Date(date + ' 23:59:59'),
      },
    };
  }

  if (service) {
    matchQuery = {
      ...matchQuery,
      service: new mongoose.Types.ObjectId(service),
    };
  }

  // const serviceObj = await Service.findById(service);

  const todayShifts = await Shift.aggregate([
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: 'modules',
        localField: 'module',
        foreignField: '_id',
        as: 'module',
      },
    },
    {
      $unwind: '$module',
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
  const { date, service } = req.query;

  let matchQuery = {
    state: { $in: ['completed', 'cancelled'] },
  };

  if (dayjs(date).isValid()) {
    matchQuery = {
      ...matchQuery,
      date: {
        $gte: new Date(date),
        $lte: new Date(date + ' 23:59:59'),
      },
    };
  }

  if (service) {
    matchQuery = {
      ...matchQuery,
      service: new mongoose.Types.ObjectId(service),
    };
  }

  const average = await Shift.aggregate([
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: 'modules',
        localField: 'module',
        foreignField: '_id',
        as: 'module',
      },
    },
    {
      $unwind: '$module',
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
  const { clientName, clientEmail, serviceId, userId } = req.body;

  const service = await Service.findById(serviceId);

  const authRequired = service.authRequired;

  const chooseRequired = service.chooseRequired;

  // console.log('chooseRequired :>> ', chooseRequired);

  const module = chooseRequired
    ? await Module.findOne({
        user: mongoose.Types.ObjectId(userId),
      }).populate({
        path: 'user',
        select: 'name isAvailable',
      })
    : null;

  // console.log('module :>> ', module);

  // console.log('service :>> ', service);

  if (chooseRequired && !module) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }

  if (
    !chooseRequired &&
    module &&
    !!!module?.services.find((s) => s._id.toString() === serviceId)
  ) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }

  let client = null;

  if (authRequired && clientEmail) {
    client = await Client.findOneAndUpdate(
      {
        email: clientEmail,
      },
      {
        $set: {
          email: clientEmail,
          name: clientName,
        },
      }
    );
    if (!client) {
      //
      //TODO: get client data from ESPE Api
      //
      client = await Client.create({
        email: clientEmail,
        name: clientName,
      });
    }
  }

  if (authRequired && !clientEmail) {
    return res.status(401).json({
      status: 'error',
      message: 'Client data is required',
    });
  }

  const startOfDay = dayjs().startOf('day');

  // console.log('startOfDay :>> ', startOfDay);

  const todayShifts = await Shift.find({
    service: service._id,
    date: {
      $gte: startOfDay,
    },
  });

  // console.log('todayShifts :>> ', todayShifts);

  const code = `${service.code}-${todayShifts.length + 1}`;

  // console.log('client :>> ', client);

  let createQuery = {
    client: client?._id,
    service: service._id,
    date: new Date(),
    code,
  };

  if (chooseRequired) {
    createQuery = {
      ...createQuery,
      module: module._id,
    };
  }

  const shift = await Shift.create(createQuery);

  const waitingShifts = todayShifts.filter((s) => s.state === 'on-hold');

  // console.log("waitingShifts :>>", waitingShifts)

  const waitTimeAvg = await Shift.aggregate([
    {
      $match: {
        service: service._id,
        state: {
          $in: ['completed', 'cancelled'],
        },
      },
    },
    {
      $project: {
        service: 1,
        waitTime: {
          $subtract: ['$startDate', '$date'],
        },
      },
    },
    {
      $group: {
        _id: '$service',
        averageWaitTime: { $avg: '$waitTime' },
      },
    },
    {
      $project: {
        _id: 0,
        user: '$_id',
        waitingAverage: {
          $divide: ['$averageWaitTime', 60 * 1000],
        },
      },
    },
  ]);

  // console.log("waitTimeAvg :>> ", waitTimeAvg)

  if (clientEmail) {
    const message = SHIFT_EMAIL(
      clientName,
      shift,
      waitingShifts.length,
      service,
      waitTimeAvg[0]?.waitingAverage ?? 0
    );
    // console.log("message :>> ", message)

    try {
      await sendEmail({
        email: clientEmail,
        subject: `Su ticket ha sido creado`,
        message,
      });
    } catch (err) {
      console.log('err :>> ', err);
    }
  }

  // console.log('waitTimeAvg :>> ', waitTimeAvg);

  io.emit('shiftCreated', userId);

  res.status(200).json({
    status: 'success',
    shift: {
      ...shift._doc,
      service,
      waiting: waitingShifts.length,
      averageWaitTime: waitTimeAvg[0]?.waitingAverage,
    },
    // todayShifts,
  });
});

exports.getShiftsByUser = catchAsync(async (req, res, next) => {
  const user = req.user.id;

  const module = await Module.findOne({
    user: new mongoose.Types.ObjectId(user),
  });

  // console.log('module :>> ', module);
  const today = dayjs().utc().format('YYYY-MM-DD');

  const shifts = await Shift.find({
    date: {
      $gte: new Date(today),
    },
    $or: [{ module: module._id }, { service: { $in: module.services } }],
  })
    .populate({
      path: 'module',
      select: 'name code user',
    })
    .populate({
      path: 'client',
      select: 'name',
    });

  res.status(200).json({
    status: 'success',
    results: shifts.length,
    shifts,
  });
});

exports.changeState = catchAsync(async (req, res, next) => {
  const { id, state, observation } = req.body;
  const user = req.user.id;

  if (!state || !id)
    return res.status(400).json({
      status: 'error',
      message: 'Invalid data',
    });

  let newData = {};

  switch (state) {
    case 'in-progress':
      const module = await Module.findOne({
        user: new mongoose.Types.ObjectId(user),
      });

      // console.log('module :>> ', module);

      newData = {
        state: 'in-progress',
        module: module._id,
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

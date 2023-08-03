const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
let io;

exports.setUserControllerIO = (socketIO) => {
  io = socketIO;
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User, (user) => {
  io.emit('changeAvailability', user.isAvailable);
});

exports.deleteUser = factory.deleteOne(User);

const filterObj = (obj, allowedFields) => {
  let filteredObj = {};
  Object.keys(obj).map((key) => {
    if (allowedFields.includes(key)) {
      filteredObj = { ...filteredObj, [key]: obj[key] };
    }
  });
  return filteredObj;
};

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You can not update this fields.', 400));
  }

  // const { name, email } = req.body;

  const filteredObj = filterObj(req.body, [
    'name',
    'email',
    'isAvailable',
    'photo',
  ]);

  // console.log('filteredObj :>> ', filteredObj);

  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  io.emit('changeAvailability', user.isAvailable);

  // if (filteredObj.isAvailable == user.isAvailable) {
  //   console.log('user :>> ', user);
  //   io.emit('changeAvailability', user.isAvailable);
  // }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

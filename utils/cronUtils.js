const catchAsync = require('./catchAsync');
const User = require('../models/userModel');

exports.resetUsersAvailability = catchAsync(async () => {
  const updated = await User.updateMany(
    { isAvailable: true },
    { isAvailable: false }
  );
  //   console.log('updated :>> ', updated);
  console.log('Users updated');
});

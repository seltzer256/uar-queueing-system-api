const express = require('express');
const {
  getAllShifts,
  deleteShift,
  updateShift,
  createShift,
  getShift,
  getShiftsByUser,
  changeState,
} = require('../controllers/shiftController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllShifts).post(createShift);

// router.route('/:id').get(getShift);

router.use(protect);

router.route('/by-user').get(getShiftsByUser);

router.route('/change-state').post(changeState);

router
  .route('/:id')
  .patch(restrictTo('user'), updateShift)
  .delete(restrictTo('user'), deleteShift);

module.exports = router;

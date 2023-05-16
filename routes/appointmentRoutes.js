const express = require('express');
const {
  getAllAppointments,
  deleteAppointment,
  updateAppointment,
  createAppointment,
  getAppointment,
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllAppointments).post(createAppointment);

router
  .route('/:id')
  .get(getAppointment)
  .patch(restrictTo('admin'), updateAppointment)
  .delete(restrictTo('admin'), deleteAppointment);

module.exports = router;

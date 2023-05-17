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

router.route('/').get(getAllAppointments).post(createAppointment);

router.route('/:id').get(getAppointment);

router.use(protect);

router
  .route('/:id')
  .patch(restrictTo('user'), updateAppointment)
  .delete(restrictTo('user'), deleteAppointment);

module.exports = router;

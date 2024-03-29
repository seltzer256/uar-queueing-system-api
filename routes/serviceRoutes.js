const express = require('express');
const {
  getAllServices,
  deleteService,
  updateService,
  createService,
  getService,
  getActiveServices,
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllServices);

router.route('/active').get(getActiveServices);

router.route('/:id').get(getService);

router.use(protect);

router.route('/').post(restrictTo('admin'), createService);

router
  .route('/:id')
  .patch(restrictTo('admin'), updateService)
  .delete(restrictTo('admin'), deleteService);

module.exports = router;

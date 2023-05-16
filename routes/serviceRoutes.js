const express = require('express');
const {
  getAllServices,
  deleteService,
  updateService,
  createService,
  getService,
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllServices);

router.route('/:id').get(getService);

router.use(protect);

router.route('/').post(createService);

router
  .route('/:id')
  .patch(restrictTo('admin'), updateService)
  .delete(restrictTo('admin'), deleteService);

module.exports = router;

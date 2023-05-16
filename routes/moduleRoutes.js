const express = require('express');
const {
  getAllModules,
  deleteModule,
  updateModule,
  createModule,
  getModule,
} = require('../controllers/moduleController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllModules);

router.route('/:id').get(getModule);

router.use(protect);

router.route('/').post(createModule);

router
  .route('/:id')
  .patch(restrictTo('admin'), updateModule)
  .delete(restrictTo('admin'), deleteModule);

module.exports = router;

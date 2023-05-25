const express = require('express');
const {
  getAllModules,
  deleteModule,
  updateModule,
  createModule,
  getModule,
  getActiveModules,
} = require('../controllers/moduleController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/active').get(getActiveModules);

router.route('/:id').get(getModule);

router.use(protect);

router.route('/').post(createModule).get(getAllModules);

router.route('/:id').patch(updateModule).delete(deleteModule);

module.exports = router;

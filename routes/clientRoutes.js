const express = require('express');
const {
  getAllClients,
  deleteClient,
  updateClient,
  createClient,
  getClient,
} = require('../controllers/clientController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllClients);

router.route('/:id').get(getClient);

router.use(protect);

router.route('/').post(createClient);

router
  .route('/:id')
  .patch(restrictTo('admin'), updateClient)
  .delete(restrictTo('admin'), deleteClient);

module.exports = router;

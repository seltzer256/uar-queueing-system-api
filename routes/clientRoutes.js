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

router.use(protect, restrictTo('admin'));

router.route('/').get(getAllClients).post(createClient);

router.route('/:id').get(getClient).patch(updateClient).delete(deleteClient);

module.exports = router;

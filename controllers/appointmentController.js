const Appointment = require('../models/appointmentModel');
const factory = require('./handlerFactory');

exports.getAllAppointments = factory.getAll(Appointment);

exports.getAppointment = factory.getOne(Appointment);

exports.createAppointment = factory.createOne(Appointment);

exports.deleteAppointment = factory.deleteOne(Appointment);

exports.updateAppointment = factory.updateOne(Appointment);

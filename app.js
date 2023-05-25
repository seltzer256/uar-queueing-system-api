const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const app = express();
const userRouter = require('./routes/userRoutes');
const serviceRouter = require('./routes/serviceRoutes');
const moduleRouter = require('./routes/moduleRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const clientRouter = require('./routes/clientRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

// 1. MIDDLEWARES

app.use(helmet());

app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimiter({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. please try again in an hour.',
});

app.use('/api', limiter);

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(xss());

app.use(express.json({ limit: '10mb' }));
app.use(express.static(`${__dirname}/public`));

// 3. ROUTES

app.use('/api/v1/users', userRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/modules', moduleRouter);
app.use('/api/v1/clients', clientRouter);

// 404 route

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

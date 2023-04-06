const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

process.on('uncaughtException', (err) => {
  console.log('err :>> ', err.name, err.message);
  console.log('UNCAUGHT REJECTION! Shutting down...');
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE;

mongoose.set('strictQuery', false);

mongoose
  .connect(DB)
  .then((con) => {
    //   console.log('con :>> ', con);S
    console.log('DB connected');
  })
  .catch((err) => {
    console.log('err :>> ', err);
  });

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

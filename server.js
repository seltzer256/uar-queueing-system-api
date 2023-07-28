const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const { setUserControllerIO } = require('./controllers/userController');
const { setShiftControllerIO } = require('./controllers/shiftController');

process.on('uncaughtException', (err) => {
  console.log('err :>> ', err.name, err.message);
  console.log('UNCAUGHT REJECTION! Shutting down...');
  process.exit(1);
});

const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server, {
  cors: {
    origin: `${WEB_URL}`,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  // console.log('socket :>> ', socket);
  console.log('a user connected');
  io.on('disconnect', () => {
    console.log('user disconnected');
  });
});

//Sockets

setUserControllerIO(io);
setShiftControllerIO(io);

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

// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

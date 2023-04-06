const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE;

mongoose.set('strictQuery', false);

mongoose.connect(DB).then((con) => {
  //   console.log('con :>> ', con);S
  console.log('DB connected');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('Data successfully loaded!');
    process.exit();
  } catch (error) {
    console.log('error :>> ', error);
  }
};

// importData()
// DELETE ALL DATA

const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (error) {
    console.log('error :>> ', error);
  }
};

// importData()

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}

console.log(process.argv);

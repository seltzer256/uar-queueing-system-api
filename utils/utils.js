const dayjs = require('dayjs');

const mongooseDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

const formatDate = (date, dayjsFormat = 'YYYY-MM-DD') => {
  return dayjs(date, dayjsFormat).utc().format(mongooseDateFormat);
};

module.exports = {
  formatDate,
  mongooseDateFormat,
};

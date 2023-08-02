const Agenda = require('agenda');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const agenda = new Agenda({
  db: { address: DB, collection: 'agendaJobs' },
  processEvery: '10 seconds',
  defaultConcurrency: 1,
});

module.exports = agenda;

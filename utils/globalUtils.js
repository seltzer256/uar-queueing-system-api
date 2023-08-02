exports.agendaDefine = (agenda, name, handler) => {
  agenda.define(name, async (job, done) => {
    await handler(job);
    done();
  });
};

exports.agendaRepeatEvery = async (agenda, name, interval) => {
  const jobExists = await agenda.jobs({ name });
  if (jobExists.length === 0) {
    const job = agenda.create(name);
    await job
      .repeatEvery(interval, {
        timezone: 'America/New_York',
      })
      .save();
  }
  return true;
};

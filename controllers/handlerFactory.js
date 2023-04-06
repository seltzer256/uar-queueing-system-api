const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const modelName = Model.modelName.toLowerCase();

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No ${modelName} found with that ID`, 404));
    }

    res.json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const modelName = `${Model.modelName.toLowerCase()}s`;
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID.', 404));
    }

    res.json({
      status: 'success',
      data: { [modelName]: doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const modelName = `${Model.modelName.toLowerCase()}s`;
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        [modelName]: newDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const modelName = `${Model.modelName.toLowerCase()}s`;

    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError(`No ${modelName} found with that ID.`, 404));
    }

    res.json({
      status: 'success',
      data: {
        [modelName]: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // const includedFields = Object.keys(Model.schema.obj);
    // const acceptedQueryObj = Object.fromEntries(
    //   Object.entries(queryObj).filter(([key]) => includedFields.includes(key))
    // );

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();
    // const allDocs = await features.query.explain();
    const allDocs = await features.query;

    res.json({ status: 'success', results: allDocs.length, data: allDocs });
  });

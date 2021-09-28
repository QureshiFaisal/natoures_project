const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

//
////////ROUTE HANDLERS
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1 B) Advanced filtering
    let queryStr = JSON.stringify(queryObj); // this will convert the object to a string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // this will search for the words and add a $ to it to convert them into a mongoose operator

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // this is default. If the user does not specify any sorting criteria we will sort the the newest created.
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1; // we convert string to number by 1.. if query is not provided default is p[age 1]
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page=2&limit=10 1-10, page 1, 11-20, page 2, 21-30 page 3
    this.query = this.query.skip(skip).limit(limit);

    // if the page number does not exists

    return this;
  }
}

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    //BUILD QUERY
    // 1 A) Filtering
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // // 1 B) Advanced filtering
    // let queryStr = JSON.stringify(queryObj); // this will convert the object to a string
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // this will search for the words and add a $ to it to convert them into a mongoose operator

    // let query = Tour.find(JSON.parse(queryStr));

    //2) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');

    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt'); // this is default. If the user does not specify any sorting criteria we will sort the the newest created.
    // }

    //3) Field Limting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    //4) Pagination
    // const page = req.query.page * 1 || 1; // we convert string to number by 1.. if query is not provided default is p[age 1]
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // //page=2&limit=10 1-10, page 1, 11-20, page 2, 21-30 page 3
    // query = query.skip(skip).limit(limit);

    // // if the page number does not exists
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments(); // this method will count the number of documents in the collection
    //   if (SKIP >= numTours) throw new Error('This page does not exist');
    // }
    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',

      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
////////
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // findById is a short-hand for Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }

  // const tour = tours.find((el) => el.id === id);
};
/////////
exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()
    const newTour = await Tour.create(req.body); // in this way we are calling create method directly on Tour instead of instantiating it
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};
///////////
exports.updateTour = async (req, res) => {
  try {
    // req.params.update will find the document to be updated by its id, req.body will pass the data to be update. return: true will return the updated document
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

//////////
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

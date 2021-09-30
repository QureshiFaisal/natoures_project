class APIFeatures {
  constructor(query, queryString) {
    //querystring is an object that contains query data sent by the client i.e (req.query) eg {duration: '5', difficulty: 'easy'}
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
    return this; // here we are returning an object of type query which is an instance of classe APIFeatures so that we can chain the following method to it.
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // this is default. If the user does not specify any sorting criteria we will sort the the newest created.
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
module.exports = APIFeatures;

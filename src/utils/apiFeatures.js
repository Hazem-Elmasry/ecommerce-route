export class ApiFeatures {
  constructor(mongooseQuery, searchQuery) {
    this.mongooseQuery = mongooseQuery;
    this.searchQuery = searchQuery;
  }
  pagination() {
    let { page, size } = this.searchQuery;
    //*incase of page is undefined or negative or zero:
    if (!page || page <= 0) {
      page = 1;
    }
    //*incase of string:
    let pageNumber = page * 1 || 1;
    //*incase of size is undefined or negative or zero:
    if (!size || size <= 0) {
      size = 5; //*or any number satisify your project
    }
    const skip = size * (pageNumber - 1);
    this.pageNumber = pageNumber;
    this.mongooseQuery.limit(size).skip(skip);
    return this;
  }
  filter() {
    let filter = { ...this.searchQuery };
    const excludedQueryParams = [
      "page",
      "size",
      "skip",
      "sort",
      "fields",
      "search",
    ];
    excludedQueryParams.forEach((element) => {
      delete filter[element];
    });
    filter = JSON.stringify(filter); //* convert filter object to string
    filter = filter.replace(
      /(eq|ne|gt|gte|lt|lte|in|nin)/g,
      (match) => `$${match}`
    ); //* replace searchVal in query with matchVal with ($) before it to work in mongoDB
    filter = JSON.parse(filter); //* convert filter back to object
    this.mongooseQuery.find(filter); //* mongoose query
    return this;
  }
  sort() {
    if (this.searchQuery.sort) {
      let sortedBy = this.searchQuery.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortedBy);
    }
    return this;
  }
  fields() {
    if (this.searchQuery.fields) {
      let fields = this.searchQuery.fields.split(",").join(" ");
      this.mongooseQuery.select(fields);
    }
    return this;
  }
  search() {
    if (this.searchQuery.search) {
      this.mongooseQuery.find({
        $or: [
          { name: { $regex: this.searchQuery.search, $options: "i" } },
          { description: { $regex: this.searchQuery.search, $options: "i" } },
          { status: { $regex: this.searchQuery.search, $options: "i" } },
        ],
      });
    }
    return this;
  }
}

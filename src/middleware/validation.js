const validation = (schema, includeToken = false) => {
  try {
    return (req, res, next) => {
      //* all input data except req.headers and req.file
      let inputData = {
        ...req.body,
        ...req.params,
        ...req.query,
      };

      //* in case of file upload
      if (req.file) {
        inputData.file = req.file;
      }

      //* in case of multiple files upload
      if (req.files) {
        inputData.files = req.files;
      }
      //* in case of autirization exist & includeToken is true:
      if (req.headers.authorization && includeToken) {
        inputData = { authorization: req.headers.authorization };
      }
      // console.log(inputData);
      //* validate on req inputs data
      const validationResult = schema.validate(inputData, {
        abortEarly: false,
      });
      //* if validationResult contains an error, pass it to req then throw it to errorHandling file
      if (validationResult?.error) {
        req.validationResult = validationResult.error;
        return next(new Error("validationError", { cause: 400 }));
      }
      //* if validation error not exists, go to next middleware
      next();
    };
  } catch (error) {
    return res.status(500).json({ message: error.message, stack: error.stack });
  }
};

export default validation;

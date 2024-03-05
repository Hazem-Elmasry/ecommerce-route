import joi from "joi";
import { Types } from "mongoose";

export const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)? true: helper.message("invalid objectId");
};

export const generalFields = {
  email: joi.string().email({ tlds: { allow: ["com", "net"] } }).required(),
  password: joi.string().required(),
  id: joi.string().custom(validateObjectId).required(),
  
  
  file: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    size: joi.number().positive().required(),
  }),
};

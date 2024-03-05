import joi from "joi";
import { generalFields, validateObjectId } from "../../utils/generalFields.js";

export const tokenSchema = joi
  .object({
    authorization: joi.string().required(),
  })
  .required();

export const whishListSchema = joi
  .object({
    productId: generalFields.id,
  })
  .required();
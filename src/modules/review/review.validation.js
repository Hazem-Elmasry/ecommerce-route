import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi
  .object({
    authorization: joi.string().required(),
  })
  .required();

export const addReviewSchema = joi
  .object({
    text: joi.string().min(1).max(100).trim().required(),
    rate: joi.number().min(0).max(5).integer().required(),
    productId: generalFields.id,
    orderId: generalFields.id,
  })
  .required();

export const removeReviewSchema = joi
  .object({
    productId: generalFields.id,
    reviewId: generalFields.id,
  })
  .required();
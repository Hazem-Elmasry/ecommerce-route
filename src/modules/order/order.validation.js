import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi
  .object({
    authorization: joi.string().required(),
  })
  .required();

export const orderSchema = joi
  .object({
    orderId: generalFields.id,
  })
  .required();

export const createOrderSchema = joi
  .object({
    couponName: joi.string().min(3).max(20).trim(),
    address: joi.string().min(20).max(100).required(),
    phone: joi.array().items(joi.string().required()).required(),
    paymentType: joi.string().valid("cash", "card"),
    note: joi.string().min(20),
    products: joi.array().items(
      joi
        .object({
          productId: generalFields.id,
          quantity: joi.number().min(1).positive().integer().required(),
        })
        .required()
    ),
    file: generalFields.file,
  })
  .required();

import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi.object({
  authorization: joi.string().required(),
}).required()

export const createCouponSchema = joi.object({
    name: joi.string().min(2).max(30).required(),
    file: generalFields.file.required(),
    amount: joi.number().positive().min(1).max(100).required(),
    expiresIn: joi.string(),
  }).required();

export const getCouponSchema = joi.object({
    couponId: generalFields.id,
  }).required();

export const updateCouponSchema = joi.object({
    couponId: generalFields.id,
    name: joi.string().min(2).max(30),
    file: generalFields.file,
    amount: joi.number().positive().min(1).max(100),
    expiresIn: joi.string(),
  }).required();

import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const signUpSchema = joi
  .object({
    userName: joi.string().min(2).max(20).required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: joi.string().valid(joi.ref("password")).required(),
    phone: joi.string().regex(/^([+])?(\d+)$/),
    gender: joi.string().valid("male", "female"),
    DOB: joi.date().max("01-01-2006").iso(),
    address: joi.string().max(50),
    file: generalFields.file,
  })
  .required();

export const loginSchema = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
  })
  .required();

export const tokenSchema = joi.object({
    token: joi.string().required(),
  }).required();

export const sendCodeSchema = joi
  .object({
    email: generalFields.email,
  })
  .required();

export const forgetPasswordSchema = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
    cPassword: joi.string().valid(joi.ref("password")).required(),
    code: joi
      .string()
      .pattern(new RegExp(/^\d{5}$/))
      .required(),
  })
  .required();

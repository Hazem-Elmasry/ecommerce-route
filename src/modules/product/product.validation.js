import joi from "joi";
import { generalFields, validateObjectId } from "../../utils/generalFields.js";

export const tokenSchema = joi
  .object({
    authorization: joi.string().required(),
  })
  .required();

export const createProductSchema = joi
  .object({
    name: joi.string().min(3).max(30).required(),
    description: joi.string().min(3).max(50),
    price: joi.number().positive().min(1).required(),
    discount: joi.number().positive(),
    stock: joi.number().positive().integer().min(1).required(),
    colors: joi.array(),
    size: joi.array(),
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,

    files: joi
      .object({
        mainImage: joi
          .array()
          .items(generalFields.file.required())
          .length(1)
          .required(),
        subImages: joi
          .array()
          .items(generalFields.file.required())
          .min(0)
          .max(5),
      })
      .required(),
  })
  .required();

export const updateProductSchema = joi
  .object({
    name: joi.string().min(3).max(30),
    description: joi.string().min(3).max(50),
    price: joi.number().positive().min(1),
    discount: joi.number().positive(),
    stock: joi.number().positive().integer().min(1),
    colors: joi.array(),
    size: joi.array(),
    productId: generalFields.id,
    subCategoryId: joi.string().custom(validateObjectId),
    brandId: joi.string().custom(validateObjectId),

    files: joi.object({
      mainImage: joi.array().items(generalFields.file.required()).length(1),
      subImages: joi.array().items(generalFields.file.required()).min(0).max(5),
    }),
  })
  .required();

export const oneProductSchema = joi
  .object({
    productId: generalFields.id,
  })
  .required();

import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi.object({
    authorization: joi.string().required(),
}).required()

export const getSubCategorySchema = joi.object({
    subCategoryId: generalFields.id,
    categoryId: generalFields.id,
}).required()

export const createSubCategorySchema = joi.object({
    name: joi.string().min(3).max(30).trim().required(),
    file: generalFields.file.required(),
    categoryId: generalFields.id,
}).required()

export const updateSubCategorySchema = joi.object({
    name: joi.string().min(3).max(20).trim(),
    file: generalFields.file,
    subCategoryId: generalFields.id,
    categoryId: generalFields.id,
}).required()
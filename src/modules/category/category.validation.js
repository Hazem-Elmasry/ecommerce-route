import joi from "joi";
import { generalFields } from "../../utils/generalFields.js";

export const tokenSchema = joi.object({
    authorization: joi.string().required(),
}).required()

export const getCategorySchema = joi.object({
    categoryId: generalFields.id,
}).required()

export const createCategorySchema = joi.object({
    name: joi.string().min(2).max(30).trim().required(),
    file: generalFields.file.required(),
}).required()

export const updateCategorySchema = joi.object({
    name: joi.string().min(2).max(30).trim(),
    file: generalFields.file,
    categoryId: generalFields.id,
}).required()
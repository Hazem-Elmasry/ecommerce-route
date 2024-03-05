import joi from "joi"
import { generalFields } from "../../utils/generalFields.js"

export const tokenSchema = joi.object({
    authorization: joi.string().required()
}).required()

export const createBrandSchema = joi.object({
    name: joi.string().min(2).max(30).required(),
    file: generalFields.file.required(),
}).required()

export const getBrandSchema = joi.object({
    brandId: generalFields.id,
}).required()

export const updateBrandSchema = joi.object({
    name: joi.string().min(2).max(30),
    file: generalFields.file,
    brandId: generalFields.id,
}).required()

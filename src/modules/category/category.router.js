import subCategoryRouter from "../subCategory/subCategory.router.js";
import categoryEndPoints from "./category.endPoint.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as categoryController from "./controller/category.controller.js";
import * as categoryValidation from "./category.validation.js";

const router = Router();

router
  .post("/",
    validation(categoryValidation.tokenSchema, true),
    auth(categoryEndPoints.create),
    uploadFile(fileValidation.image).single("image"),
    validation(categoryValidation.createCategorySchema),
    categoryController.createCategory
  )
  .get("/", categoryController.allCategories)
  .get("/:categoryId",
    validation(categoryValidation.getCategorySchema),
    categoryController.getCategory
  )
  .put("/:categoryId",
    validation(categoryValidation.tokenSchema, true),
    auth(categoryEndPoints.update),
    uploadFile(fileValidation.image).single("image"),
    validation(categoryValidation.updateCategorySchema),
    categoryController.updateCategory
  )
  .use("/:categoryId/subCategory", subCategoryRouter);

export default router;

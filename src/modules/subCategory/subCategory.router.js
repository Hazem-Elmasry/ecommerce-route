import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import subCategoryEndPoints from "./subCategory.endPoint.js";
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
import * as subCategoryController from "./controller/subCategory.controller.js";
import * as subCategoryValidation from "./subCategory.validation.js";
const router = Router({ mergeParams: true });

router
  .post("/",
    validation(subCategoryValidation.tokenSchema, true),
    auth(subCategoryEndPoints.create),
    uploadFile(fileValidation.image).single("image"),
    validation(subCategoryValidation.createSubCategorySchema),
    subCategoryController.createSubCategory
  )
  .get("/", subCategoryController.getAllSubCategories)
  .get("/:subCategoryId",
    validation(subCategoryValidation.getSubCategorySchema),
    subCategoryController.getSubCategory
  )
  .put("/:subCategoryId",
    validation(subCategoryValidation.tokenSchema, true),
    auth(subCategoryEndPoints.update),
    uploadFile(fileValidation.image).single("image"),
    validation(subCategoryValidation.updateSubCategorySchema),
    subCategoryController.updateSubCategory
  );

export default router;

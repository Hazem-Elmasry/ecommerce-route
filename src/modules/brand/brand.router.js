import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import brandEndPoints from "./brand.endPoint.js";
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
import * as brandController from "./controller/brand.controller.js";
import * as brandValidation from "./brand.validation.js";

const router = Router();

router
  .post(
    "/",
    validation(brandValidation.tokenSchema, true),
    auth(brandEndPoints.create),
    uploadFile(fileValidation.image).single("image"),
    validation(brandValidation.createBrandSchema),
    brandController.createBrand
  )
  .get("/", brandController.allBrands)
  .get(
    "/:brandId",
    validation(brandValidation.getBrandSchema),
    brandController.getBrand
  )
  .put(
    "/:brandId",
    validation(brandValidation.tokenSchema, true),
    auth(brandEndPoints.update),
    uploadFile(fileValidation.image).single("image"),
    validation(brandValidation.updateBrandSchema),
    brandController.updateBrand
  );

export default router;

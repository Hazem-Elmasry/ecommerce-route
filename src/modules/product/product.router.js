import { Router } from "express";
import { fileValidation, uploadFile } from "../../utils/multer.js";
import * as productController from "./controller/product.controller.js";
import * as productValidation from "./product.validation.js";
import productEndPoints from "./product.endPoint.js";
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
import reviewRouter from "../review/review.router.js";
const router = Router();

//* route to review router
router.use("/:productId/review", reviewRouter);

router
  .post(
    "/",
    validation(productValidation.tokenSchema, true),
    auth(productEndPoints.create),
    uploadFile(fileValidation.image).fields([
      { name: "mainImage", maxCount: 1 },
      { name: "subImages", maxCount: 5 },
    ]),
    validation(productValidation.createProductSchema),
    productController.createProduct
  )
  .put(
    "/:productId",
    validation(productValidation.tokenSchema, true),
    auth(productEndPoints.update),
    uploadFile(fileValidation.image).fields([
      { name: "mainImage", maxCount: 1 },
      { name: "subImages", maxCount: 5 },
    ]),
    validation(productValidation.updateProductSchema),
    productController.updateProduct
  )
  .get("/", productController.allProducts)
  .get(
    "/:productId",
    validation(productValidation.oneProductSchema),
    productController.oneProduct
  );

export default router;

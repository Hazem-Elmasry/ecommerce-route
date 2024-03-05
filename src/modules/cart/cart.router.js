import { Router } from "express";
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
import cartEndPoint from "./cart.endPoint.js";
import * as cartController from "./controller/cart.controller.js";
import * as cartValidation from "./cart.validation.js";
const router = Router();

router
  .post(
    "/",
    validation(cartValidation.tokenSchema, true),
    auth(cartEndPoint.create),
    validation(cartValidation.addToCartSchema),
    cartController.addToCart
  )
  .patch(
    "/:productId",
    validation(cartValidation.tokenSchema, true),
    auth(cartEndPoint.create),
    // validation(cartValidation.deleteFromCartSchema),
    cartController.deleteFromCart
  )
  .patch(
    "/",
    validation(cartValidation.tokenSchema, true),
    auth(cartEndPoint.create),
    // validation(cartValidation.clearProductsFromCartSchema),
    cartController.clearProductsFromCart
  );

export default router;

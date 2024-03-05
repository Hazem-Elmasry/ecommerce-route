import { Router } from "express";
import * as userController from "./controller/user.controller.js";
import * as userValidation from "./user.validation.js";
import userEndPoints from "../user/user.endPoint.js";
import auth from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";

const router = Router();

router
  .patch(
    "/addToWhishList/:productId",
    validation(userValidation.tokenSchema, true),
    validation(userValidation.whishListSchema),
    auth(userEndPoints.add),
    userController.addToWhishList
  )
  .patch(
    "/removeFromWhishList/:productId",
    validation(userValidation.tokenSchema, true),
    validation(userValidation.whishListSchema),
    auth(userEndPoints.remove),
    userController.removeFromWhishList
  )
  .get(
    "/getLoggedUserWhishList",
    auth(userEndPoints.get),
    userController.getLoggedUserWhishList
  );
export default router;

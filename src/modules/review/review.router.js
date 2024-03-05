import { Router } from "express";
import * as reviewController from "./controller/review.controller.js";
import * as reviewValidation from "./review.validation.js";
import reviewEndPoints from "./review.endPoint.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";
const router = Router({ mergeParams: true });

router
  .post(
    "/",
    validation(reviewValidation.tokenSchema, true),
    validation(reviewValidation.addReviewSchema),
    auth(reviewEndPoints.add),
    reviewController.addReview
  )
  .delete(
    "/:reviewId",
    validation(reviewValidation.tokenSchema, true),
    validation(reviewValidation.removeReviewSchema),
    auth(reviewEndPoints.remove),
    reviewController.removeReview
  )

export default router;

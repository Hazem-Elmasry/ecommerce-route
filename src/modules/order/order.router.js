import { Router } from "express";
import * as orderController from "./controller/order.controller.js";
import * as orderValidation from "./order.validation.js";
import orderEndPoint from "./order.endPoint.js";
import validation from "../../middleware/validation.js";
import auth from "../../middleware/auth.js";

const router = Router();

router
  .post(
    "/",
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.createOrderSchema),
    auth(orderEndPoint.create),
    orderController.createOrder
  )
  .patch(
    "/:orderId/canceled",
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.orderSchema),
    auth(orderEndPoint.cancel),
    orderController.cancelOrder
  )
  .patch(
    "/:orderId/delivered",
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.orderSchema),
    auth(orderEndPoint.delivered),
    orderController.deliveredOrder
  )
  .get(
    "/:orderId",
    validation(orderValidation.tokenSchema, true),
    validation(orderValidation.orderSchema),
    auth(orderEndPoint.getSpecific),
    orderController.getSpecificOrder
  )
  .get("/", orderController.getAllOrders);
//   .patch(
//     "/:orderId/rejected",
//     validation(orderValidation.tokenSchema, true),
//     validation(orderValidation.orderSchema),
//     auth(orderEndPoint.rejected),
//     orderController.rejectedOrder
//   )

export default router;

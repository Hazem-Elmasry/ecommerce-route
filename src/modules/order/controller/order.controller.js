import productModel from "../../../../DB/model/Product.model.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
// import createInvoice from "../../../utils/createInvoice.js";
// import sendEmail from "../../../utils/email.js";
// import cloudinary from "../../../utils/cloudinary.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import payment from "../../../utils/payment.js";

//* === create order ===//
// Two Senarios:=>
// [1] order the cart. [2] order some of products from cart
// 1- check if cart exist.
// 2- loop for all products, check: > exist,in stock, isDeleted ? , then push inside array, then req.___.body.
// 3- create order.
// 4- check if coupon exists. "before for lopp",  then check if expires.
export const createOrder = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  let { products, couponName } = req.body;

  let coupon = { amount: 0 };
  if (couponName) {
    coupon = await couponModel.findOne({
      name: couponName,
      usedBy: { $nin: _id },
    });
    if (!coupon) {
      return next(new Error("invalid coupon", { cause: 404 }));
    }
    if (coupon.expiresIn.getTime() < new Date().getTime()) {
      return next(new Error("coupon is expired", { cause: 400 }));
    }
    req.body.couponId = coupon._id;
  }

  if (!products?.length) {
    const cartExist = await cartModel.findOne({ userId: _id });

    if (!cartExist?.products?.length && !products) {
      return next(new Error("invalid cart", { cause: 400 }));
    }
    products = cartExist.products.toObject();
  }

  const allproducts = [];
  let subPrice = 0;
  for (const product of products) {
    const productExist = await productModel.findOne({
      _id: product.productId,
      isDeleted: false,
      stock: { $gte: product.quantity },
    });
    if (!productExist) {
      return next(new Error("product not exist", { cause: 404 }));
    }
    product.name = productExist.name;
    product.unitPrice = productExist.finalPrice;
    product.finalPrice = productExist.finalPrice * product.quantity;
    subPrice += product.finalPrice;
    allproducts.push(product);
  }

  req.body.products = allproducts;
  req.body.subPrice = subPrice;
  req.body.totalPrice = subPrice - (subPrice * coupon?.amount || 0) / 100;
  req.body.userId = _id;
  req.body.paymentType == "cash"
    ? (req.body.status = "placed")
    : (req.body.status = "waitForPayment");

  for (const product of products) {
    //* to decrease the quantity of products ordered from the stock:
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: -parseInt(product.quantity) } }
    );
    //* to remove products ordered from the user cart:
    await cartModel.updateOne(
      { userId: _id },
      {
        $pull: {
          products: {
            productId: { $in: product.productId },
          },
        },
      }
    );
  }

  if (couponName) {
    await couponModel.updateOne(
      { _id: coupon._id },
      { $push: { usedBy: _id } }
    );
  }

  const order = await orderModel.create(req.body);

  //* payment method card (stripe):
  if (order.paymentType == "card") {
    try {
      const session = payment({
        success_url: `${process.env.SUCCESS_URL_STRIPE}/${order._id}`,
        cancel_url: `${process.env.CANCEL_URL_STRIPE}/${order._id}`,
        customer_email: req.user.email,
        line_items: order.products.map((element) => {
          return {
            price_data: {
              currency: "egp",
              product_data: {
                name: element.name,
              },
              unit_amount: element.unitPrice,
            },
            quantity: element.quantity,
          };
        }),
      });
      return res
        .status(201)
        .json({ message: "online order done", order, session });
    } catch (error) {
      return res.json({ message: "error", error, stack: error.stack });
    }
  }

  // const invoice = {
  //   shipping: {
  //     name: req.user.userName,
  //     address: order.address,
  //     city: "Cairo",
  //     state: "New Cairo",
  //     country: "Egypt",
  //     postal_code: 11183,
  //   },
  //   items: order.products,
  //   subtotal: subPrice,
  //   paid: 0,
  //   invoice_nr: order._id,
  //   createdAt: order.createdAt,
  // };

  // const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // const pdfPath = path.join(
  //   __dirname,
  //   `./../../../tempInvoices/${order._id}.pdf`
  // );

  // createInvoice(invoice, pdfPath);

  //! postman "globalErrorMessage": "[object Object]"
  // const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
  //   folder: `${process.env.APP_NAME}/order/invoices`,
  // });

  // if (
  //   !(await sendEmail({
  //     to: req.user.email,
  //     subject: "Order Invoice",
  //     attachments: [
  //       {
  //         filename: `${order._id}.pdf`,
  //         path: pdfPath,
  //         contentType: "application/pdf",
  //       },
  //     ],
  //   }))
  // ) {
  //   return next(new Error("email not sent", { cause: 400 }));
  // }

  // fs.unlinkSync(pdfPath);

  return res.status(201).json({
    message: "cash order done",
    order,
  });
});

//* === get specific order ===//
export const getSpecificOrder = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { orderId } = req.params;
  let order = await orderModel.findOne({ _id: orderId, userId: _id });
  !order
    ? next(new Error("order not found", { cause: 404 }))
    : res.status(200).json({ message: "done", order });
});

//* === get all orders ===//
export const getAllOrders = asyncHandler(async (req, res, next) => {
  let apiFeature = new ApiFeatures(orderModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();

  let orders = await apiFeature.mongooseQuery;
  !orders
    ? next(new Error("orders not found", { cause: 404 }))
    : res
        .status(200)
        .json({ message: "done", page: apiFeature.pageNumber, orders });
});

//* === cancel order ===//
// 1- check if order is exist by orderId.
// 2- cancel order in two cases only => order status is 'placed' or 'waitForPayment'
// 2- resume stock number to every product that returned.
// 3- remove userId from usedBy at coupon to could use it again.
// 4- update order status to 'cancel' & pull usedBy
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findById({ _id: orderId });
  if (!order) {
    return next(new Error("invalid order", { cause: 404 }));
  }
  if (order.status != "placed" && order.status != "waitForPayment") {
    return next(new Error("can not cancel your order", { cause: 400 }));
  }

  for (const product of order.products) {
    // resume stock number to every product that returned
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: parseInt(product.quantity) } }
    );
  }

  // remove userId from usedBy at coupon to could use it again.
  if (order.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: req.user._id } }
    );
  }
  const cancelOrder = await orderModel.updateOne(
    { _id: orderId },
    { status: "cancel", updatedBy: req.user._id }
  );
  if (!cancelOrder) {
    return next(new Error("fail when cancel order", { cause: 500 }));
  }
  return res.status(200).json({ message: "order cancelled", cancelOrder });
});

//* === deliverd order ===//
// 1- check if order is exist by orderId.
// 2- order marked as delivered in case of => order status is 'onWay'
// 3- update order status to 'delivered'
export const deliveredOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findById({ _id: orderId });
  if (!order) {
    return next(new Error("invalid order", { cause: 404 }));
  }
  if (order.status != "onWay") {
    return next(new Error("can not delivere your order", { cause: 400 }));
  }
  const deliveredOrder = await orderModel.updateOne(
    { _id: orderId },
    { status: "delivered", updatedBy: req.user._id }
  );
  return res.status(200).json({ message: "order delivered", deliveredOrder });
});

//* === create checkout session ===//
// export const createCheckOutSession = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//
//   const order = await orderModel.findById(id);
//
//   let session = await stripe.checkout.sessions.create({
//     line_items: [
//       {
//         price_data: {
//           product_data: {
//             name: req.user.userName,
//           },
//           unit_amount: order.totalPrice * 100,
//           currency: "egp",
//         },
//       },
//     ],
//     mode: "payment",
//     success_url: process.env.SUCCESS_URL_STRIPE,
//     cancel_url: process.env.CANCEL_URL_STRIPE,
//     customer_email: req.user.email,
//     client_reference_id: id,
//     metadata: req.body.address,
//   });
//   res.json({ message: "success", session });
//   // res.redirect(303, session.url)
// });

//* === rejected order ===//
// 1- check if order is exist by orderId.
// 2- reject order in case of => order status is 'onWay'
// 2- resume stock number to every product that returned.
// 3- remove userId from usedBy at coupon to could use it again.
// 4- update order status to 'rejected' & pull usedBy
// export const rejectedOrder = asyncHandler(async (req, res, next) => {
//   const { orderId } = req.params;
//   const order = await orderModel.findById({ _id: orderId });
//   if (!order) {
//     return next(new Error("invalid order", { cause: 404 }));
//   }
//   if (order.status != "placed" && order.status != "waitForPayment") {
//     return next(new Error("invalid cancel order", { cause: 400 }));
//   }

//   for (const product of order.products) {
// resume stock number to every product that returned
//     await productModel.updateOne(
//       { _id: product.productId },
//       { $inc: { stock: parseInt(product.quantity) } }
//     );
// remove userId from usedBy at coupon to could use it again.
//     if (order.couponId) {
//       await couponModel.updateOne(
//         { _id: order.couponId },
//         { $pull: { usedBy: req.user._id } }
//       );
//     }

//     const updatedOrder = await orderModel.updateOne(
//       { _id: orderId },
//       { status: "cancel", updatedBy: req.user._id }
//     );
//     return res.status(200).json({ message: "order cancelled", updatedOrder });
//   }
// });

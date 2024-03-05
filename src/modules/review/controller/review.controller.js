import orderModel from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import reviewModel from "../../../../DB/model/Review.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

//* === add Review === //
// 1- check if productId exists
// 2- check if this user orderd this product before
// 3- check if this user wrote review on this product before
// 4- create review
export const addReview = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { text, rate, orderId } = req.body;
  const { productId } = req.params;

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new Error("product is not found", { cause: 404 }));
  }

  if (
    !(await orderModel.findOne({
      _id: orderId,
      status: "delivered",
      userId: _id,
      "products.productId": productId,
    }))
  ) {
    return next(new Error("order is not found", { cause: 404 }));
  }

  if (await reviewModel.findOne({ userId: _id, productId, orderId })) {
    return next(new Error("user already review before", { cause: 400 }));
  }

  const review = await reviewModel.create({
    text,
    rate,
    orderId,
    productId,
    userId: _id,
  });

  //* calc avgRate (forOf loop):
  //   const reviews = await reviewModel.find({ productId });
  //   let sum = 0;
  //   for (const review of reviews) {
  //     sum += review.rate;
  //   }
  //   product.avgRate = (sum / reviews.length).toFixed(1);
  //   product.rateCount += 1;
  //   await product.save();
  //* calc avgRate(mathimatically without loop):
  let sum = product.avgRate * product.rateCount;
  sum = sum + review.rate;
  product.avgRate = (sum / (product.rateCount + 1)).toFixed(1);
  product.rateCount += 1;
  await product.save();

  return res.status(201).json({ message: "review added successfully", review });
});

//* === remove Review === //
export const removeReview = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { productId, reviewId } = req.params;

  const product = await productModel.findById({ _id: productId });
  if (!product) {
    return next(new Error("product is not found", { cause: 404 }));
  }

  const review = await reviewModel.findOneAndDelete({
    _id: reviewId,
    userId: _id,
  });
  if (!review) {
    return next(new Error("review is not found", { cause: 404 }));
  }

  //* calc avgRate(mathimatically without loop):
  let sum = product.avgRate * product.rateCount;
  sum = sum - review.rate;
  product.avgRate = (sum / (product.rateCount - 1)).toFixed(1);
  product.rateCount -= 1;
  await product.save();

  return res.status(200).json({ message: "review removed successfully" });
});

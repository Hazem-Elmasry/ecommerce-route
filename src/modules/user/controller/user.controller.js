import productModel from "../../../../DB/model/Product.model.js";
import userModel from "../../../../DB/model/User.model.js";

import { asyncHandler } from "../../../utils/errorHandling.js";

//* === add To WhishList === //
export const addToWhishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findOne({
    _id: productId,
    isDeleted: false,
  });
  if (!product) {
    return next(new Error("invalid product", { cause: 404 }));
  }
  const user = await userModel
    .findByIdAndUpdate(
      { _id: req.user._id },
      { $addToSet: { whishList: product._id } },
      { new: true }
    )
    .select("userName email whishList status")
    .populate([{ path: "whishList" }]);
  return res.json({ message: "done", user });
});

//* === remove from WhishList === //
export const removeFromWhishList = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findOne({
    _id: productId,
    isDeleted: false,
  });
  if (!product) {
    return next(new Error("invalid product", { cause: 404 }));
  }
  const whishList = await userModel
    .findByIdAndUpdate(
      { _id: req.user._id },
      { $pull: { whishList: product._id } },
      { new: true }
    )
    .select("userName email whishList status")
    .populate([{ path: "whishList" }]);
  !whishList
    ? next(new Error("whishlist not found", { cause: 404 }))
    : res.status(200).json({ message: "done", whishList });
});

//* === get logged user whishList === //
export const getLoggedUserWhishList = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const whishList = await userModel
    .findById(_id)
    .populate({ path: "whishList" });
  !whishList
    ? next(new Error("whishlist not found", { cause: 404 }))
    : res.status(200).json({ message: "done", whishList: whishList.whishList });
});

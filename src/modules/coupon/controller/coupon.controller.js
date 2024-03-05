import couponModel from "../../../../DB/model/Coupon.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

//* === create Coupon ===:-
export const createCoupon = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (await couponModel.findOne({ name })) {
    return next(new Error("name is already exists", { cause: 409 }));
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/coupons`,
      }
    );
    if (!secure_url) {
      return next(new Error("image not found", { cause: 400 }));
    }
    req.body.image = { secure_url, public_id };
  }
  req.body.createdBy = req.user._id;
  const coupon = await couponModel.create(req.body);
  return res.status(201).json({ message: "done", coupon });
});

//* === get all Coupons ===:-
export const allCoupons = asyncHandler(async (req, res, next) => {
  let apiFeature = new ApiFeatures(couponModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();
  const coupons = await apiFeature.mongooseQuery;
  return res
    .status(200)
    .json({ message: "done", page: apiFeature.pageNumber, coupons });
});

//* === get Coupon by id ===:-
export const getCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await couponModel.findById({ _id: couponId });
  if (!coupon) {
    return next(new Error("invalid couponId", { cause: 404 }));
  }
  return res.status(200).json({ message: "done", coupon });
});

//* === update Coupon ===:-
export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;
  const couponExist = await couponModel.findById({ _id: couponId });
  if (!couponExist) {
    return next(new Error("Invalid coupon Id", { cause: 404 }));
  }

  if (req.body.name) {
    if (await couponModel.findOne({ name: req.body.name })) {
      return next(new Error("name is already exists", { cause: 409 }));
    }
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/coupons` }
    );
    if (!secure_url) {
      return next(new Error("image not found", { cause: 400 }));
    }
    if (couponExist?.image.public_id) {
      await cloudinary.uploader.destroy(couponExist.image.public_id);
    }
    req.body.image = { secure_url, public_id };
  }

  req.body.updatedBy = req.user._id;
  const newCoupon = await couponModel.findOneAndUpdate(
    { _id: couponId },
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "updated successfully", coupon: newCoupon });
});

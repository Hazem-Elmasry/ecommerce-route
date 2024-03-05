import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

//*=== Create brand ===:-
// 1- check if name is exist? -> name exist (stop)
//                            -> continue
// 2- upload image with cloudinary.
// 3- create slug "slugify".
// 4- req.body.createdBy = req.user._id
// 5- create category with all of above.
export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (await brandModel.findOne({ name })) {
    return next(new Error("name is already exists", { cause: 409 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/brands`,
    }
  );
  if (!secure_url) {
    return next(new Error("image not found", { cause: 400 }));
  }
  req.body.image = { secure_url, public_id };
  req.body.slug = slugify(name);
  req.body.createdBy = req.user._id;
  const brand = await brandModel.create(req.body);
  return res.status(201).json({ message: "done", brand });
});

//*=== Get all brands ===:-
export const allBrands = asyncHandler(async (req, res, next) => {
  let apiFeature = new ApiFeatures(brandModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();
  const brands = await apiFeature.mongooseQuery;
  // const brands = await brandModel.find();
  return res
    .status(200)
    .json({ message: "done", page: apiFeature.pageNumber, brands });
});

//*=== Get brand by id ====:-
export const getBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await brandModel.findById({ _id: brandId });
  if (!brand) {
    return next(new Error("invalid brandId", { cause: 404 }));
  }
  return res.status(200).json({ message: "done", brand });
});

//*=== Update brand ======= :-
//1- find if brand exist.
//2- if update name -> find if name is NOT exist --> change slug
//3- if update image -> upload new image -> delete old image from cloud
//4- req.body.updatedBy = req.user._id
//4- update brand in DB.
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { brandId } = req.params;
  const brand = await brandModel.findById({ _id: brandId });
  if (!brand) {
    return next(new Error("Invalid Brand Id", { cause: 404 }));
  }

  if (req.body.name) {
    if (await brandModel.findOne({ name: req.body.name })) {
      return next(new Error("name is already exists", { cause: 409 }));
    }
    req.body.slug = slugify(req.body.name);
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/brands` }
    );
    if (!secure_url) {
      return next(new Error("image not found", { cause: 400 }));
    }
    req.body.image = { secure_url, public_id };
    await cloudinary.uploader.destroy(brand.image.public_id);
  }

  req.body.updatedBy = req.user._id;

  const newBrand = await brandModel.findOneAndUpdate(
    { _id: brandId },
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "updated successfully", brand: newBrand });
});

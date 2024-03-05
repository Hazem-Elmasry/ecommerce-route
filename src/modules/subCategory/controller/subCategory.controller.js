import { asyncHandler } from "../../../utils/errorHandling.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

//*=== Create subCategory ===:-
// 1- check by categoryId if category exists
// 2- check if subcategory name is exist? -> name exist (stop)
//                            -> continue
// 3- upload subcategory image with cloudinary.
// 4- create subcategory slug "slugify".
// 5- add categoryId to req.body:
// 6- req.body.createdBy = req.user._id
// 7- create subCategory.
export const createSubCategory = asyncHandler(async (req, res, next) => {
  //step 1:
  const { categoryId } = req.params;
  if (!(await categoryModel.findById({ _id: categoryId }))) {
    return next(new Error("invalid category id", { cause: 404 }));
  }
  //step 2:
  const { name } = req.body;
  if (await subCategoryModel.findOne({ name })) {
    return next(new Error("name is already exists", { cause: 409 }));
  }
  //step 3:
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/category/${categoryId}/subCategories`,
    }
  );
  if (!secure_url) {
    return next(new Error("image not found", { cause: 400 }));
  }
  req.body.image = { secure_url, public_id };
  //step 4:
  req.body.slug = slugify(name);
  //step-5:
  req.body.categoryId = categoryId;
  //step 6:
  req.body.createdBy = req.user._id;
  //step 7:
  const subCategory = await subCategoryModel.create(req.body);
  return res.status(201).json({ message: "done", subCategory });
});
// //*=== Get all subCategories ===:-
export const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  let apiFeature = new ApiFeatures(subCategoryModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();

  let subCategories = await apiFeature.mongooseQuery
    .find({ categoryId })
    .populate([{ path: "categoryId" }]);
  
    !subCategories
    ? next(new Error("subCategories not found", { cause: 404 }))
    : res
        .status(200)
        .json({ message: "done", page: apiFeature.pageNumber, subCategories });
});
// //*=== Get subCategory by id ====:-
export const getSubCategory = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  const subCategory = await subCategoryModel
    .findById({ _id: subCategoryId })
    .populate([{ path: "categoryId" }]);
  res.status(200).json({ message: "done", subCategory });
});
// //*=== Update subCategory ======= :-
//1- find if subCategory exist.
//2- if update name -> find if name is NOT exist --> change slug
//3- if update image -> upload new image -> delete old image from cloud
//4- req.body.updatedBy = req.user._id
//5- update subCategory in DB.
export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { subCategoryId } = req.params;
  //step 1:
  const subCategoryExist = await subCategoryModel.findById({
    _id: subCategoryId,
  });
  if (!subCategoryExist) {
    return next(new Error("invalid subCategory id!", { cause: 404 }));
  }
  //step 2:
  if (req.body.name) {
    if (await subCategoryModel.findOne({ name: req.body.name })) {
      return next(new Error("name is already exist", { cause: 409 }));
    }
    req.body.slug = slugify(req.body.name);
  }
  //step 3:
  if (req.file) {
    //upload new image:
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/category/${req.params.categoryId}/subCategories`,
      }
    );
    if (!public_id) {
      return next(new Error("image not found", { cause: 400 }));
    }
    req.body.image = { secure_url, public_id };
    //delete the old one:
    await cloudinary.uploader.destroy(subCategoryExist.image.public_id);
  }
  //step 4:
  req.body.updatedBy = req.user._id;
  //step 5:
  const updatedSubCategory = await subCategoryModel.findOneAndUpdate(
    { _id: subCategoryId },
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "updated successfully", subCategory: updatedSubCategory });
});

import { asyncHandler } from "../../../utils/errorHandling.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

//*=== Create category ===:-
// 1- check if name is exist? -> name exist (stop)
//                            -> continue
// 2- upload image with cloudinary => req.body.image
// 3- create slug "slugify" => req.body.slug
// 4- req.body.createdBy = req.user._id
// 5- create category with all of above.
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  //step 1:
  if (await categoryModel.findOne({ name })) {
    return next(new Error("name is already exists", { cause: 409 }));
  }
  //step 2:
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/category`,
    }
  );
  if (!secure_url) {
    return next(new Error("image not found", { cause: 400 }));
  }
  req.body.image = { secure_url, public_id };
  //step 3:
  req.body.slug = slugify(name).toLowerCase();
  //step 4:
  req.body.createdBy = req.user._id;
  //step 5:
  const category = await categoryModel.create(req.body);
  return res.status(201).json({ message: "done", category });
});
//*=== Get all categories ===:-
export const allCategories = asyncHandler(async (req, res, next) => {
  let apiFeature = new ApiFeatures(categoryModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();

  const categories = await apiFeature.mongooseQuery.populate([
    { path: "subCategories" },
  ]);
  res
    .status(200)
    .json({ message: "done", page: apiFeature.pageNumber, categories });
});
//*=== Get category by id ====:-
export const getCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const category = await categoryModel
    .findById({ _id: categoryId })
    .populate([{ path: "subCategories" }]);
  res.status(200).json({ message: "done", category });
});
//*=== Update category ======= :-
//1- find if category exist.
//2- if update name -> find if name is NOT exist --> change slug
//3- if update image -> upload new image -> delete old image from cloud
//4- req.body.updatedBy = req.user._id
//5- update category in DB.
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  //step 1:
  const category = await categoryModel.findById({ _id: categoryId });
  if (!category) {
    return next(new Error("invalid category id!", { cause: 404 }));
    // return res.status(404).json({ message: "invalid category id" })
  }
  //step 2:
  if (req.body.name) {
    if (await categoryModel.findOne({ name: req.body.name })) {
      return next(new Error("name is already exist", { cause: 409 }));
      // return res.status(409).json({ message: "name is already exist" });
    }
    req.body.slug = slugify(req.body.name).toLowerCase();
  }
  //step 3:
  if (req.file) {
    //upload new image:
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/category` }
    );
    if (!public_id) {
      return next(new Error("image not found", { cause: 400 }));
      // return res.status(400).json({ message: "image not found" })
    }
    req.body.image = { secure_url, public_id };
    //delete the old one:
    await cloudinary.uploader.destroy(category.image.public_id);
  }
  //step 4:
  req.body.updatedBy = req.user._id;
  //step 5:
  const updatedCategory = await categoryModel.findOneAndUpdate(
    { _id: categoryId },
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "updated successfully", category: updatedCategory });
});

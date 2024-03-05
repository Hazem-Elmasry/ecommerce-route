import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import brandModel from "../../../../DB/model/Brand.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

//* === create product ===:-
// 1- receive categoryId,subCategoryId,brandId then check over them
// 2- create slug
// 3- calc finalPrice from price & discount
// 4- create customId
// 5- upload main image
// 6- check if subImage existts => upload
// 7- req.body => createdBy
export const createProduct = asyncHandler(async (req, res, next) => {
  const { categoryId, subCategoryId, brandId, price, discount } = req.body;

  if (!(await categoryModel.findById({ _id: categoryId }))) {
    return next(new Error("invalid category id!", { cause: 404 }));
  }
  if (!(await subCategoryModel.findById({ _id: subCategoryId }))) {
    return next(new Error("invalid subCategory id!", { cause: 404 }));
  }
  if (!(await brandModel.findById({ _id: brandId }))) {
    return next(new Error("Invalid Brand Id", { cause: 404 }));
  }

  req.body.slug = slugify(req.body.name, {
    trim: true,
    lower: true,
  });

  req.body.finalPrice = price - (price * discount || 0) / 100;

  req.body.customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${process.env.APP_NAME}/product/${req.body.customId}/mainImage`,
    }
  );
  if (!secure_url) {
    return next(new Error("image not found", { cause: 404 }));
  }
  req.body.mainImage = { secure_url, public_id };

  if (req.files?.subImages?.length) {
    let images = [];
    for (const subImage of req.files?.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        subImage.path,
        {
          folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages`,
        }
      );
      if (!secure_url) {
        return next(new Error("image not found", { cause: 404 }));
      }
      images.push({ secure_url, public_id });
    }
    req.body.subImages = images;
  }

  req.body.createdBy = req.user._id;

  const product = await productModel.create(req.body);
  return res.status(201).json({ message: "done", product });
});

//* === update product ===:-
// 1- recieve data: productId => find if product exists
// 2- if (subcategoryId) => find if subcategory exists
// 3- if (brandId) => find if brand exists
// 4- if (req.body.name) => change slug
// 5- if (price || discount || price&&discount) => change finalPrice
// 6- if (mainImage)
// 7- if (subImages)
// 8- req.body => updatedBy
// 9- update product
export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const productExist = await productModel.findById({ _id: productId });
  if (!productExist) {
    return next(new Error("invalid product id!", { cause: 404 }));
  }
  if (
    req.body.subCategoryId &&
    !(await subCategoryModel.findById({ _id: req.body.subCategoryId }))
  ) {
    return next(new Error("invalid subCategory id!", { cause: 404 }));
  }
  if (
    req.body.brandId &&
    !(await brandModel.findById({ _id: req.body.brandId }))
  ) {
    return next(new Error("invalid brand id!", { cause: 404 }));
  }
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, {
      trim: true,
      lower: true,
    });
  }

  req.body.finalPrice =
    (req.body.price || productExist.price) -
    ((productExist.price || req.body.price) *
      (req.body.discount || productExist.discount)) /
      100;

  if (req.files?.mainImage?.length) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      {
        folder: `${process.env.APP_NAME}/product/${productExist.customId}/mainImage`,
      }
    );
    if (!secure_url) {
      return next(new Error("image not found", { cause: 404 }));
    }
    await cloudinary.uploader.destroy(productExist.mainImage.public_id);
    req.body.mainImage = { secure_url, public_id };
  }
  if (req.files?.subImages?.length) {
    for (const subImage of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        subImage.path,
        {
          folder: `${process.env.APP_NAME}/product/${productExist.customId}/subImages`,
        }
      );
      if (!secure_url) {
        return next(new Error("image not found", { cause: 404 }));
      }
      productExist.subImages.push({ secure_url, public_id });
    }
    req.body.subImages = productExist.subImages;
  }
  req.body.updatedBy = req.user._id;
  const updatedProduct = await productModel.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true }
  );
  return res.status(200).json({ message: "Done", updatedProduct });
});

//* === get all products ===:-
export const allProducts = asyncHandler(async (req, res, next) => {
  let apiFeature = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .fields()
    .search();

  let products = await apiFeature.mongooseQuery;
  !products
    ? next(new Error("products not found", { cause: 404 }))
    : res
        .status(200)
        .json({ message: "done", page: apiFeature.pageNumber, products });
});

//* === get product by Id ===:-
export const oneProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById({ _id: req.params.productId });
  if (!product) {
    return next(new Error("invalid product id", { cause: 404 }));
  }
  return res.status(200).json({ message: "done", product });
});

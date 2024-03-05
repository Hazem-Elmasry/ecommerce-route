import mongoose, { Schema, model, Types } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"], //* [dataType, message for validation]
      trim: true, //* To remove white spaces from both sides of the string.
      lowercase: true,
      min: 3,
      max: 30,
    },
    slug: {
      type: String,
      required: [true, "product slug is required"],
      trim: true,
      lowercase: true,
    },
    description: String,
    colors: [String],
    size: [String],
    stock: {
      type: Number,
      required: [true, "stock number is required"],
    },
    // product price before discount
    price: {
      type: Number,
      required: [true, "price is required"],
      min: 1,
    },
    discount: {
      type: Number,
      default: 0,
    },
    // product price after discount
    finalPrice: Number,
    mainImage: {
      type: Object,
      required: [true, "image is required"],
    },
    subImages: [
      {
        type: Object,
      },
    ],
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "categoryId is required"],
    },
    subCategoryId: {
      type: Types.ObjectId,
      ref: "SubCategory",
      required: [true, "subCategoryId is required"],
    },
    brandId: {
      type: Types.ObjectId,
      ref: "Brand",
      required: [true, "brandId is required"],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    customId: {
      type: String,
      required: true,
    },
    rateCount: {
      type: Number,
      default: 0,
    },
    avgRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
// mongoose.model.Product ||
const productModel = model("Product", productSchema);
export default productModel;

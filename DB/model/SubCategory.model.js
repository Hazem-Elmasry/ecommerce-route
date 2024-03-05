import mongoose, { Schema, model, Types } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "subCategory name is required"], //* [dataType, message for validation]
      unique: [true, "subCategory name must be unique value"],
      trim: true, //* To remove white spaces from both sides of the string.
      lowercase: true,
    },
    slug: {
      type: String,
      required: [true, "subCategory slug is required"],
      unique: [true, "subCategory slug must be unique value"],
      trim: true,
      lowercase: true,
    },
    image: {
      type: Object,
      required: [true, "image is required"],
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "categoryId is required"],
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
  },
  {
    timestamps: true,
  }
);
// mongoose.model.SubCategory ||
const subCategoryModel = model("SubCategory", subCategorySchema);
export default subCategoryModel;

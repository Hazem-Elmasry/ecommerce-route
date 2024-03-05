import mongoose, { Schema, model, Types } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "brand name is required"], //* [dataType, message for validation]
      unique: [true, "brand name must be unique value"],
      trim: true, //* To remove white spaces from both sides of the string.
      lowercase: true,
    },
    slug: {
      type: String,
      required: [true, "brand slug is required"],
      unique: [true, "brand slug must be unique value"],
      trim: true,
      lowercase: true,
    },
    image: {
      type: Object,
      required: [true, "image is required"],
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
// mongoose.model.Brand ||
const brandModel =  model("Brand", brandSchema);
export default brandModel;

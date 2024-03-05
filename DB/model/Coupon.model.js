import mongoose, { Schema, model, Types } from "mongoose";

const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name is required"], //* [dataType, message for validation]
      // unique: [true, "coupon name must be unique value"],
      trim: true, //* To remove white spaces from both sides of the string.
      lowercase: true,
    },
    amount: {
      type: Number,
      required: [true, "coupon amount is required"],
    },
    // discount: {
    //   type: String,
    //   required: [true, "coupon slug is required"],
    //   unique: [true, "coupon slug must be unique value"],
    //   trim: true,
    //   lowercase: true,
    // },
    expiresIn: {
      type: Date,
      required: true,
    },
    image: {
      type: Object,
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
    usedBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const couponModel = mongoose.model.Coupon || model("Coupon", couponSchema);
export default couponModel;

import { Schema, model, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 100,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Product",
    },
    orderId: {
      type: Types.ObjectId,
      ref: "Order",
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// mongoose.model.Review ||
const reviewModel = model("Review", reviewSchema);
export default reviewModel;

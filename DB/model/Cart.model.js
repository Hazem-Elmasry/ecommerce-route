import mongoose, { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
          unique: true,
        },
        quantity: {
          type: Number,
          requird: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
// mongoose.model.Cart ||
const cartModel =  model("Cart", cartSchema);
export default cartModel;

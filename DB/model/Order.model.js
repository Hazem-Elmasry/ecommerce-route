import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },
    address: {
      type: String,
      requird: [true, "address is required"],
    },
    phone: {
      type: [String],
      requird: [true, "phone is required"],
    },
    note: String,
    products: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: [true, "productId is required"],
        },
        name: {
          type: String,
          required: [true, "name is required"],
          min: 3,
          max: 30,
        },
        // the price of one peice of product
        unitPrice: {
          type: Number,
          required: [true, "unitPrice is required"],
          min: 1,
        },
        quantity: {
          type: Number,
          required: [true, "quantity is required"],
          min: 1,
        },
        // unitPrice * quantity
        finalPrice: {
          type: Number,
          required: [true, "finalPrice is required"],
          min: 1,
        },
      },
    ],
    // the price of order before using coupon
    subPrice: {
      type: Number,
      required: [true, "subPrice is required"],
      min: 1,
    },
    couponId: {
      type: Types.ObjectId,
      ref: "Coupon",
    },
    // the price of order after using coupon
    totalPrice: {
      type: Number,
      required: [true, "totalPrice is required"],
      min: 1,
    },
    paymentTypes: {
      type: String,
      enum: ["cash", "card"],
      default: "Cash",
    },
    status: {
      type: String,
      enum: [
        "placed",
        "cancel",
        "rejected",
        "waitForPayment",
        "onWay",
        "delivered",
      ],
      default: "placed",
    },
    reason: String,
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

//mongoose.model.Order ||
const orderModel = model("Order", orderSchema);
export default orderModel;

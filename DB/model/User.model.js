import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      min: [2, "minimum length is 2 charachters "],
      max: [20, "maximum length is 20 charachters "],
      lowercase: true,
    },
    email: {
      type: String,
      unique: [true, "email must be unique"],
      required: [true, "email is required"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    gender: {
      type: String,
      default: "Male",
      enum: ["Male", "Female"],
    },
    code: String,
    image: String, //* in this e-commerce user does not need an profile image, so i let it optional
    DOB: String,
    phone: String,
    address: String, //* at first it is not required until the user make a payment, it must be updated his address field to continue
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin"],
    },
    status: {
      type: String,
      default: "Offline",
      enum: ["Offline", "Online"],
    },
    whishList: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ],
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // isBlocked: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);
// mongoose.model.User ||
const userModel = model("User", userSchema);
export default userModel;

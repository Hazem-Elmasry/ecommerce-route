import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"], //! [dataType, message for validation]
      unique: [true, "category name must be unique value"], //! [dataType, message for validation]
      trim: true, //! To remove white spaces from both sides of the string.
      lowercase: true,
    },
    slug: {
      type: String,
      required: [true, "category slug is required"],
      unique: [true, "category slug must be unique value"],
      trim: true,
      lowercase: true,
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
    image: {
      type: Object,
      required: [true, "image is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, //* To include virtuals in res.json() and show data
    toObject: { virtuals: true }, //* To make operations on virtual data.
  }
);

//* Virtual property that show the subcategories inside category when get categories:
categorySchema.virtual("subCategories", {
  ref: "SubCategory", //* child to the parent
  localField: "_id",
  foreignField: "categoryId",
});
// mongoose.model.Category ||
const categoryModel = model("Category", categorySchema);
export default categoryModel;

import cartModel from "../../../../DB/model/Cart.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";

//* === add product to cart === //
// 1- recieve 'userId' from req.user => check if he has a cart? => push => update
//          ...if he dosen't has a cart? create new cart ...
// 2- recieve 'productId, quantity' from body and check if this product exist? =>
// 3-
export const addToCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { productId, quantity } = req.body;
  const cart = await cartModel.findOne({ userId: _id });
  const product = await productModel.findOne({
    _id: productId,
    isDeleted: false,
    stock: { $gte: quantity },
  });

  //* product not exist in DB:
  if (!product) {
    return next(new Error("invalid productId", { cause: 404 }));
  }
  //* cart not exist in DB:- "create newCart"...
  if (!cart) {
    const data = {
      userId: _id,
      products: [
        {
          productId: product._id,
          quantity,
        },
      ],
    };

    const newCart = await cartModel.create(data);
    return res.status(201).json({ message: "done", cart: newCart });
  }

  let exist = false;

  //* product exist:
  for (let product of cart.products) {
    if (product.productId.toString() == productId) {
      product.quantity = quantity;
      exist = true;
      break;
    }
  }
  //* product not exist:
  if (!exist) {
    const add = await cartModel.findByIdAndUpdate(
      { _id: cart._id },
      {
        $push: {
          products: [
            {
              productId: product._id,
              quantity,
            },
          ],
        },
      },
      { new: true }
    );
    return res.status(200).json({ message: "done", cart: add });
  }
  const add = await cartModel.findByIdAndUpdate(
    { _id: cart._id },
    {
      $push: {
        products: [
          {
            productId: product._id,
            quantity,
          },
        ],
      },
    },
    { new: true }
  );
  return res.status(200).json({ message: "done", cart: add });
});

//* === delete product from cart === //
// 1- recieve 'userId' and check if this cartId exist?
// 2-
export const deleteFromCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const cart = await cartModel.findOne({ userId: _id });
  if (!cart) {
    return next(new Error("cart not found", { cause: 404 }));
  }

  const newCart = await cartModel.findByIdAndUpdate(
    { _id: cart._id },
    {
      $pull: {
        products: {
          productId: { $in: req.params.productId },
        },
      },
    },
    { new: true }
  );
  return res.status(200).json({ message: "done", cart: newCart });
});
//* === clear all products from cart === //
// 1- recieve 'userId' and check if this cartId exist?
// 2-
export const clearProductsFromCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const cart = await cartModel.findOne({ userId: _id });
  if (!cart) {
    return next(new Error("cart not found", { cause: 404 }));
  }

  const newCart = await cartModel.findByIdAndUpdate(
    { _id: cart._id },
    { products: [] },
    { new: true }
  );
  return res.status(200).json({ message: "done", cart: newCart });
});

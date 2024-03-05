import connectDB from "../DB/connection.js";
import { globalError } from "./utils/errorHandling.js";
import categoryRouter from "./modules/category/category.router.js";
import subCategoryRouter from "./modules/subCategory/subCategory.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import authRouter from "./modules/auth/auth.router.js";
import productRouter from "./modules/product/product.router.js";
import cartRouter from './modules/cart/cart.router.js'
import orderRouter from './modules/order/order.router.js'
import userRouter from './modules/user/user.router.js'

const initApp = (express, app) => {
  //* convert Buffer Data
  app.use(express.json({}));

  //* API Routing
  app.use("/category", categoryRouter);
  app.use("/subCategory", subCategoryRouter);
  app.use("/brand", brandRouter);
  app.use("/coupon", couponRouter);
  app.use("/auth", authRouter);
  app.use("/product", productRouter);
  app.use("/cart", cartRouter);
  app.use('/order', orderRouter)
  app.use('/user', userRouter)

  app.all("*", (req, res, next) => {
    res.send("Invalid Routing, Plz check url or method");
  });
  app.use(globalError);
  connectDB();
};
export default initApp;

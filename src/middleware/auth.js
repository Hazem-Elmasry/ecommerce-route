import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { verifyToken } from "../utils/generateAndVerifyToken.js";

export const roles = {
  Admin: "Admin",
  User: "User",
};

const auth = (role = Object.values(roles)) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(
        new Error("plz login with a valid Bearer Key", { cause: 400 })
      );
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(new Error("invalid token", { cause: 400 }));
    }
    const decoded = verifyToken({
      token,
      signature: process.env.TOKEN_SIGNATURE,
    });
    if (!decoded?.id) {
      return next(new Error("invalid token payload", { cause: 400 }));
    }
    const authUser = await userModel
      .findById(decoded.id)
      .select("userName email role status");
    if (!authUser) {
      return next(new Error("user not found", { cause: 404 }));
    }
    if (authUser.status != "Online") {
      return next(new Error("invalid token plz login", { cause: 400 }));
    }
    if (!role.includes(authUser.role)) {
      return next(new Error("user is not authorized", { cause: 401 }));
    }
    req.user = authUser;
    return next();
  });
};

export default auth;

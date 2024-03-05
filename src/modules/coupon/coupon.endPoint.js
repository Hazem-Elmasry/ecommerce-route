import { roles } from "../../middleware/auth.js";

const couponEndPoints = {
  create: [roles.Admin],
  update: [roles.Admin],
};

export default couponEndPoints;

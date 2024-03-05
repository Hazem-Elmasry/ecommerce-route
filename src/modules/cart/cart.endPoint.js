import { roles } from "../../middleware/auth.js";

const cartEndPoint = {
  create: [roles.Admin], // change back to User
  update: [roles.User],
};

export default cartEndPoint;

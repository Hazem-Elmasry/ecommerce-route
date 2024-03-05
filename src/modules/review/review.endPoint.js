import { roles } from "../../middleware/auth.js";

const reviewEndPoints = {
  add: [roles.Admin], //change to user
  remove: [roles.Admin], //change to user
};

export default reviewEndPoints;

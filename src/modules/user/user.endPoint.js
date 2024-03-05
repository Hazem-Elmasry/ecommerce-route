import { roles } from "../../middleware/auth.js";

const userEndPoints = {
  add: [roles.Admin], // change to User
  remove: [roles.Admin], // change to User
  get: [roles.Admin], // change to User
};

export default userEndPoints;

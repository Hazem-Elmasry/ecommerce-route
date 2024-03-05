import { roles } from "../../middleware/auth.js";

const orderEndPoint = {
  create: [roles.Admin], // change to User
  cancel: [roles.Admin], // change to User
  delivered: [roles.Admin], // suppose to be the shipment company
  // rejected: [roles.Admin],
  getSpecific: [roles.Admin], // change to User
  getAll: [roles.Admin], // correct Admin is allowed
};
export default orderEndPoint;

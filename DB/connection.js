import mongoose from "mongoose";

const connectDB = async () => {
  return await mongoose
    .connect(process.env.CONNECT_DB_URI)
    .then((res) => console.log(`DB connected Successfully ....`))
    .catch((err) => console.log(`Fail to connect to DB ... ${err}`));
};

export default connectDB;

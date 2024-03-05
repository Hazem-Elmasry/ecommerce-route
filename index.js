import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("./config/.env") });
import express from "express";
import initApp from "./src/index.router.js";
const app = express();
import cors from "cors";

app.use(cors());

// var whitelist = ["http://example1.com", "http://example2.com"];

// if (process.env.MOOD == "dev") {
//   app.use(cors());
// } else {
//   app.use(async (req, res, next) => {
//     if (!whitelist.includes(req.header("origin"))) {
//       return next(new Error("Not allowed by CORS", { cause: 502 }));
//     }
//     res.set({
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Headers": "*",
//       "Access-Control-Allow-Private-Network": "true",
//       "Access-Control-Allow-Method": "*",
//     });
//     next();
//   });
// }

const port = +process.env.PORT || 5000;

initApp(express, app);
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Server is running on port ${port}!`));

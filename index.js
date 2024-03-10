import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("./config/.env") });
import express from "express";
import initApp from "./src/index.router.js";
const app = express();
import cors from "cors";

app.use(cors());

const port = +process.env.PORT || 5000;

initApp(express, app);
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Server is running on port ${port}!`));

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("err", error);
    });

    app.listen(process.env.PORT || 4000, () => {
      console.log(`server is running in port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });

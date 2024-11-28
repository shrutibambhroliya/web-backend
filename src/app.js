import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
<<<<<<< HEAD
    origin: [process.env.CORS_ORIGIN, "http://localhost:3001"],
=======
    origin: process.env.CORS_ORIGIN,
>>>>>>> 3068a70022e2dfb0590b369687f5f66c8f344869
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import categoryRouter from "./routes/category.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.routes.js";
import reviewRouter from "./routes/review.routes.js";
import paymentRouter from "./routes/payment.routes.js";

app.use("/api/a1/users", userRouter);
app.use("/api/a1/products", productRouter);
app.use("/api/a1/category", categoryRouter);
app.use("/api/a1/order", orderRouter);
app.use("/api/a1/cart", cartRouter);
app.use("/api/a1/review", reviewRouter);
app.use("/api/a1/payment", paymentRouter);

export default app;

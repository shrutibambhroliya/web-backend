import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addProductReview,
  getProductReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();
router.route("/r/:productId").post(verifyJwt, addProductReview);
router.route("/r/:productId").get(verifyJwt, getProductReview);
router.route("/r/:productId/review/:reviewId").delete(verifyJwt, deleteReview);
export default router;

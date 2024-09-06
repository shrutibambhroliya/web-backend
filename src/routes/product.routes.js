import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductImage,
  addProductReview,
  getProductReview,
  deleteReview,
} from "../controllers/product.controller.js";

const router = Router();
router.route("/createProduct").post(
  upload.fields([
    {
      name: "images",
      maxCount: 5,
    },
  ]),
  verifyJwt,
  createProduct
);
router.route("/getAllProducts").get(verifyJwt, getAllProducts);
router.route("/g/:productId").get(verifyJwt, getProductById);
router.route("/g/:productId").patch(verifyJwt, updateProduct);
router
  .route("/h/:productId")
  .patch(
    verifyJwt,
    upload.fields([{ name: "images", maxCount: 5 }]),
    verifyJwt,
    updateProductImage
  );
router.route("/d/:productId").delete(verifyJwt, deleteProduct);
router.route("/d/:productId").post(verifyJwt, addProductReview);
router.route("/h/:productId").get(verifyJwt, getProductReview);
router.route("/h/:productId/review/:reviewId").delete(verifyJwt, deleteReview);

export default router;

import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductImage,
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
  isAdmin,
  createProduct
);

router.route("/getAllProducts").get(getAllProducts);

router.route("/getAllProducts").get(verifyJwt, getAllProducts);

router.route("/g/:productId").get(verifyJwt, getProductById);
router.route("/g/:productId").patch(verifyJwt, isAdmin, updateProduct);
router
  .route("/h/:productId")
  .patch(
    verifyJwt,
    upload.fields([{ name: "images", maxCount: 5 }]),
    updateProductImage
  );
router.route("/d/:productId").delete(verifyJwt, isAdmin, deleteProduct);

export default router;

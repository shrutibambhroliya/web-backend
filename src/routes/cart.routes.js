import { Router } from "express";
import {
  addItemToCart,
  clearCart,
  getUserCart,
  removeItemFromCart,
} from "../controllers/cart.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/addToCart").post(verifyJwt, addItemToCart);
router.route("/getUserCart").get(verifyJwt, getUserCart);
router.route("/removeCartItem").post(verifyJwt, removeItemFromCart);
router.route("/clearCart").post(verifyJwt, clearCart);
export default router;

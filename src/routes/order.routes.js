import { Router } from "express";
import { isAdmin, verifyJwt } from "../middlewares/auth.middleware.js";
import {
  orderCreate,
  getOrderById,
  getUserOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.route("/createOrder").post(verifyJwt, orderCreate);
router.route("/o/:orderId").get(verifyJwt, getOrderById);
router.route("/getUserOrder").get(verifyJwt, getUserOrder);
router.route("/o/:orderId").patch(verifyJwt, isAdmin, updateOrderStatus);
router.route("/o/:orderId").delete(verifyJwt, isAdmin, deleteOrder);

export default router;

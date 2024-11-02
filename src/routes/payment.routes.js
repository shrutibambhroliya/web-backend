import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  processPayment,
  getPaymentDetail,
} from "../controllers/payment.controller.js";
const router = Router();

router.route("/processPayment").post(verifyJwt, processPayment);
router.route("/p/:paymentId").get(verifyJwt, getPaymentDetail);

export default router;

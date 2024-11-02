import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import Stripe from "stripe";
import { Payment } from "../models/paymnetModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const processPayment = asyncHandler(async (req, res) => {
  const { user, order, paymentMethod, amount, currency, token } = req.body;
  console.log("body", req.body);
  try {
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: currency,
      source: token,
      description: `Order ${order} payment`,
    });

    const payment = new Payment({
      user,
      order,
      paymentMethod,
      transactionId: charge.id,
      paymentStatus: "Completed",
    });

    await payment.save();

    return res
      .status(200)
      .json(new apiResponse(200, payment, "payment successfully"));
  } catch (error) {}
});

const getPaymentDetail = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentDetail = await Payment.findById(paymentId);

    if (!paymentDetail) {
      throw new apiError(400, "payment detail not found");
    }
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          paymentDetail,
          "payment detail fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError("payment detail fetch processing error");
  }
});

export { processPayment, getPaymentDetail };

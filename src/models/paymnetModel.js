import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
  transactionId: {
    type: String,
    required: true,
  },
});

export const Payment = mongoose.model("Payment", paymentSchema);

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true },
    comment: { type: String },
    name: { type: String },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);

export { reviewSchema };

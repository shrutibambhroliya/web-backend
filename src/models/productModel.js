import mongoose from "mongoose";
import { reviewSchema } from "./reviewModel.js";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      parentCategory: {
        type: String,
        enum: ["Men", "Women", "Kids"], // Allowed values
        default: null,
        required: true,
      },
      type: {
        type: String,
        enum: [
          "TopWear",
          "BottomWear",
          "WinterWear",
          "Shoes",
          "HandBags",
          "Caps",
          "Glasses",
        ], // Validating the type values
        default: null,
        required: true,
      },
    },

    reviews: [reviewSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

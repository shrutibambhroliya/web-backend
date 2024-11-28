import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: { type: String },

  parentCategory: {
    type: String,
    enum: ["Men", "Women", "Kids"], // Allowed values
    default: null,
  },
  type: {
    type: String,
    enum: ["TopWear", "BottomWear", "WinterWear"], // Validating the type values
    default: null,
  },
});

export const Category = mongoose.model("Category", categorySchema);

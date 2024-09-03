import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

export const Category = mongoose.model("Category", categorySchema);

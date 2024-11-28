import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: { type: String },
<<<<<<< HEAD
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
=======
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
>>>>>>> 3068a70022e2dfb0590b369687f5f66c8f344869
});

export const Category = mongoose.model("Category", categorySchema);

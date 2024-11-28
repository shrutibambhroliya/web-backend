import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Category } from "../models/categoryModel.js";

const createCategory = asyncHandler(async (req, res) => {
<<<<<<< HEAD
  const { name, description, parentCategory, type } = req.body;

  console.log("req", req.body);

  const allowedCategories = ["Men", "Women", "Kids"];
  const allowTypes = ["TopWear", "BottomWear", "WinterWear"];

  if ([name, description].some((field) => field?.trim() === "")) {
    throw new apiError(404, "all field is require");
  }

  if (parentCategory && !allowedCategories.includes(parentCategory)) {
    throw new apiError(404, "Invalid parent category!");
  }

  if (type && !allowTypes.includes(type)) {
    throw new apiError(404, "Invalid cloth types");
  }

=======
  const { name, description, parentCategory } = req.body;

  console.log("req", req.body);
  if (
    [name, description, parentCategory].some((field) => field?.trim() === "")
  ) {
    throw new apiError(404, "all field is require");
  }

>>>>>>> 3068a70022e2dfb0590b369687f5f66c8f344869
  const existCategory = await Category.findOne({ name });

  if (existCategory) {
    throw new apiError(404, "category name already exist");
  }

  const category = await Category.create({
    name,
    description,
    parentCategory,
<<<<<<< HEAD
    type,
=======
>>>>>>> 3068a70022e2dfb0590b369687f5f66c8f344869
  });

  if (!category) {
    throw new apiError(400, "something went wrong while create category");
  }

  return res
    .status(200)
    .json(new apiResponse(200, category, "category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const category = await Category.find({});
    return res
      .status(200)
      .json(new apiResponse(200, category, "all category found"));
  } catch (error) {
    throw new apiError(400, error?.message || "categories not found");
  }
});

const getCategoryId = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new apiError(400, "category not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, category, "category founded successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
<<<<<<< HEAD
  const { name, description, parentCategory, type } = req.body;
=======
  const { name, description, parentCategory } = req.body;
>>>>>>> 3068a70022e2dfb0590b369687f5f66c8f344869

  if (!name || !description) {
    throw new apiError(400, "all field is required");
  }

  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: {
        name,
        description,
        parentCategory,
<<<<<<< HEAD
        type,
=======
>>>>>>> 3068a70022e2dfb0590b369687f5f66c8f344869
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(200, updateCategory, "category updated successfully")
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  try {
    const deleteCat = await Category.findByIdAndDelete(categoryId);
    if (!deleteCat) {
      throw new apiError(400, "category not found");
    }
    return res
      .status(200)
      .json(new apiResponse(200, deleteCat, "category deleted successfully"));
  } catch (error) {
    throw new apiError(404, error?.message || "server error");
  }
});

export {
  createCategory,
  getAllCategories,
  getCategoryId,
  updateCategory,
  deleteCategory,
};

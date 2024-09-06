import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Category } from "../models/categoryModel.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory } = req.body;

  console.log("req", req.body);
  if (
    [name, description, parentCategory].some((field) => field?.trim() === "")
  ) {
    throw new apiError(404, "all field is require");
  }

  const existCategory = await Category.findOne({ name });

  if (existCategory) {
    throw new apiError(404, "category name already exist");
  }

  const category = await Category.create({
    name,
    description,
    parentCategory,
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
  const { name, description, parentCategory } = req.body;

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

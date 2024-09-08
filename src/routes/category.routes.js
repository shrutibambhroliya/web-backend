import { Router } from "express";
import { isAdmin, verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryId,
  updateCategory,
} from "../controllers/category.controller.js";

const router = Router();
router.route("/createCategory").post(verifyJwt, isAdmin, createCategory);
router.route("/getAllCategories").get(verifyJwt, getAllCategories);
router.route("/c/:categoryId").get(verifyJwt, getCategoryId);
router.route("/c/:categoryId").patch(verifyJwt, isAdmin, updateCategory);
router.route("/c/:categoryId").delete(verifyJwt, isAdmin, deleteCategory);

export default router;

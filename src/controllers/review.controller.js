import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/productModel.js";

const addProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { ratings, comment, name } = req.body;
  console.log("body", req.body);

  const product = await Product.findById(productId);

  if (!product) {
    throw new apiError(400, "product not found");
  }

  const alreadyReview = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReview) {
    throw new apiError(400, "you have already reviewed this product");
  }

  const review = {
    user: req.user?._id,
    ratings: Number(ratings),
    name,
    comment,
  };
  console.log("review", review);
  product.reviews.push(review);

  product.numReview = product.reviews.length;

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.ratings;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, product, "new review created successfully"));
});

const getProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.query;

  const product = await Product.findById(productId).select("reviews");

  if (!product) {
    throw new apiError(404, "product not found");
  }

  //find the specific review by userId

  const review = product.reviews.find((rev) => rev.user.toString() === userId);

  if (!review) {
    throw new apiError(404, "review not found this user");
  }

  return res
    .status(200)
    .json(new apiResponse(200, review, "all reviews fetch successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params; // Extract productId and reviewId from request parameters

  const product = await Product.findById(productId);

  if (!product) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Product not found"));
  }

  // Find the index of the review to delete
  const reviewIndex = product.reviews.findIndex(
    (rev) => rev._id.toString() === reviewId
  );

  if (reviewIndex === -1) {
    return res.status(404).json(new apiResponse(404, null, "Review not found"));
  }

  // Remove the review
  product.reviews.splice(reviewIndex, 1);

  // Update number of reviews and ratings
  product.numReview = product.reviews.length;
  product.ratings =
    product.reviews.reduce((acc, item) => acc + item.ratings, 0) /
      product.reviews.length || 0;

  await product.save({ validateBeforeSave: false });

  console.log("Updated Ratings:", product.ratings);

  return res
    .status(200)
    .json(new apiResponse(200, product, "Review deleted successfully"));
});

export { addProductReview, getProductReview, deleteReview };

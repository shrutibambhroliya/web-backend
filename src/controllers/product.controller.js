import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/productModel.js";
import { deleteFromCloudinary, uploadCloudinary } from "../utils/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, ratings } = req.body;

  if (
    [name, description, price, category, stock, ratings].some(
      (fields) =>
        fields.trim() === "" || isNaN(price) || isNaN(stock) || isNaN(ratings)
    )
  ) {
    throw new apiError(400, "all fields are required");
  }

  const existProduct = Product.findOne({ name });
  if (!existProduct) {
    throw new apiError(400, "product already exist");
  }

  let productImages = [];
  if (req.files && req.files.images && req.files.images.length > 0) {
    productImages = req.files.images.map((file) => file.path);
    console.log("uploaded images", productImages);
  } else {
    throw new apiError(400, "product images are required");
  }

  const uploadImages = await Promise.all(
    productImages.map(async (image) => {
      const uploadResult = await uploadCloudinary(image);
      return uploadResult.url;
    })
  );
  console.log("uploadImages", uploadImages);

  if (!uploadImages || uploadImages.length === 0) {
    throw new apiError(400, "some images could not be upload Cloudinary");
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    ratings,
    images: uploadImages,
    createdBy: req.user._id,
  });

  if (!product) {
    throw new apiError(400, "something went wrong while creating products");
  }

  return res
    .status(200)
    .json(new apiResponse(200, product, "product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) {
      throw new apiError(400, "products not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, products, "products have founded"));
  } catch (error) {
    throw new apiError(400, error?.message || "server error");
  }
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(400, "products have required");
  }

  return res
    .status(200)
    .json(new apiResponse(200, product, "product Id founded"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  console.log("productId", productId);
  const { name, description, price, category, stock, ratings } = req.body;
  console.log("req.body", req.body);

  if (!name || !description) {
    throw new apiError(400, "all field require");
  }

  const newProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        name,
        description,
        price,
        category,
        stock,
        ratings,
      },
    },
    { new: true }
  );

  if (!newProduct) {
    throw new apiError(400, "product not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, newProduct, "updated product successfully"));
});

const updateProductImage = asyncHandler(async (req, res) => {
  // Ensure req.files is an object and has images

  const localPaths = req.files?.images; // Should be an array of files
  if (!localPaths || localPaths.length === 0) {
    throw new apiError(400, "No files were uploaded");
  }
  console.log("localPath", localPaths);

  const { productId } = req.params;
  console.log("productId", productId);

  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  const oldProductImages = product.images;
  console.log("oldProductImages", oldProductImages);

  if (!oldProductImages) {
    throw new apiError(400, "No existing images found for this product");
  }

  if (oldProductImages.length > 0) {
    await Promise.all(
      oldProductImages.map(async (imgUrl) => deleteFromCloudinary(imgUrl))
    );
  }

  const newProductImages = await Promise.all(
    localPaths.map(async (file) => {
      const uploadResult = await uploadCloudinary(file.path); // Ensure this is correct
      return uploadResult.url;
    })
  );
  console.log("newProductImages", newProductImages);

  if (newProductImages.length === 0) {
    throw new apiError(400, "No images uploaded to Cloudinary");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        images: newProductImages,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedProduct,
        "Product images updated successfully"
      )
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  console.log("productId", productId);

  try {
    const result = await Product.findByIdAndDelete(productId);
    console.log("result", result);

    if (!result) {
      throw new apiError(400, error.message || "product not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, result, "product delete successfully"));
  } catch (error) {
    console.log("error during deletion", error);
    throw new apiError(400, error.message || "server error");
  }
});

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

// const deleteReview = async (req, res) => {
//   const { productId } = req.params;
//   const { reviewsId } = req.query;

//   const product = await Product.findById(productId);

//   if (!product) {
//     throw new apiError(400, "product not found");
//   }

//   const review = product.reviews.find(
//     (rev) => rev?._id.toString() === reviewsId
//   );

//   if (review === -1) {
//     throw new apiError(404, "review not found");
//   }

//   product.reviews.split(review, 1);

//   product.numReview = product.reviews.length;

//   product.ratings =
//     product.reviews.reduce((acc, item) => acc + item.ratings, 0) /
//       product.reviews.length || 0;

//   await product.save({ validateBeforeSave: false });

//   console.log("rat", product.ratings);

//   return res
//     .status(200)
//     .json(new apiResponse(200, product, "review deleted successfully"));
// };

const deleteReview = async (req, res) => {
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
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductImage,
  deleteProduct,
  addProductReview,
  getProductReview,
  deleteReview,
};

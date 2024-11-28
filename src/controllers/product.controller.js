import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/productModel.js";
import { deleteFromCloudinary, uploadCloudinary } from "../utils/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, parentCategory, type } = req.body;
  console.log("b", req.body);

  // check for required field
  if (
    [name, description, price].some(
      (fields) => fields.trim() === "" || isNaN(price)
    )
  ) {
    throw new apiError(400, "all fields are required");
  }

  // validate category
  const validParentCategories = ["Men", "Women", "Kids"];
  const validTypes = [
    "TopWear",
    "BottomWear",
    "WinterWear",
    "Shoes",
    "HandBags",
    "Caps",
    "Glasses",
  ];

  if (!validParentCategories.includes(parentCategory)) {
    throw new error(400, "Invalid parent category!");
  }

  if (!validTypes.includes(type)) {
    throw new error(400, "Invalid type!");
  }

  // check if product already exist!
  // const existProduct = await Product.findOne({ name });
  // if (existProduct) {
  //   throw new apiError(400, "product already exist");
  // }

  // handle product images
  let productImages = [];
  if (req.files && req.files.images && req.files.images.length > 0) {
    productImages = req.files.images.map((file) => file.path);
    console.log("uploaded images", productImages);
  } else {
    throw new apiError(400, "product images are required");
  }

  // upload image to cloudinary
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

  // create product
  const product = await Product.create({
    name,
    description,
    price,
    images: uploadImages,
    category: {
      parentCategory,
      type,
    },
    createdBy: req.user._id,
  });

  await product.save();

  if (!product) {
    throw new apiError(400, "something went wrong while creating products");
  }

  return res
    .status(200)
    .json(new apiResponse(200, product, "product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).populate(
      "category",
      "parentCategory type"
    );
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

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductImage,
  deleteProduct,
};

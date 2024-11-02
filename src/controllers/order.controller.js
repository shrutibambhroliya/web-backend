import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Order } from "../models/orderModel.js";

const orderCreate = asyncHandler(async (req, res) => {
  const { name, lastName, cart, shippingAddress, paymentMethod, totalPrice } =
    req.body;
  console.log("b", req.body);

  if (!cart || cart.length === 0) {
    throw new apiError(400, "orderItem not provide");
  }

  if (!shippingAddress || !paymentMethod || !totalPrice || !name || !lastName) {
    throw new apiError(400, "all fields is require");
  }

  const existOrder = await Order.findOne({
    $or: [{ name }, { lastName }],
  });

  if (existOrder) {
    throw new apiError(400, "order already exist");
  }

  const order = await Order.create({
    user: req.user._id,
    name,
    lastName,
    cart,
    shippingAddress,
    paymentMethod,
    totalPrice,
  });

  return res
    .status(200)
    .json(new apiResponse(200, order, "order created successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new apiError(400, "order not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, order, "order found successfully"));
});

const getUserOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.find({})
      .populate({
        path: "cart",
        populate: {
          path: "cartItem.product",
        },
      })

      .populate("user");
    if (!order || order.length === 0) {
      throw new apiError(400, "order not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, order, "order funded successfully"));
  } catch (error) {
    throw new apiError(400, "server error");
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  const validateStatus = ["Processing", "Shipped", "Delivered"];

  if (!validateStatus.includes(orderStatus)) {
    throw new apiError(404, "invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new apiError(404, "order not found");
  }

  order.orderStatus = orderStatus;

  if (orderStatus === "Delivered") {
    order.paymentStatus = "Completed";
  }
  console.log("pa", order.paymentStatus);

  await order.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, order, "orderStatus updated successfully"));
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) {
    throw new apiError(400, "order not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, order, "order deleted successfully"));
});

export {
  orderCreate,
  getOrderById,
  getUserOrder,
  updateOrderStatus,
  deleteOrder,
};

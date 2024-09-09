import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Cart } from "../models/cartModel.js";

const addItemToCart = asyncHandler(async (req, res) => {
  const { user, product, quantity } = req.body;

  console.log("req.body", req.body);

  try {
    let cart = await Cart.findOne({ user });

    if (cart) {
      const itemIndex = cart.cartItem.findIndex(
        (item) => item.product.toString() === product.toString()
      );

      if (itemIndex > -1) {
        let productItem = cart.cartItem[itemIndex];
        productItem.quantity += quantity;
        cart.cartItem[itemIndex] = productItem;
      } else {
        cart.cartItem.push({ product, quantity });
      }
    } else {
      cart = new Cart({
        user,
        cartItem: [{ product, quantity }],
      });
    }

    await cart.save();
    return res
      .status(200)
      .json(new apiResponse(200, cart, "cart add successfully"));
  } catch (error) {
    throw new apiError(400, "something went wrongs");
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const cartUser = await Cart.findOne({ user: userId }).populate("cartItem");

    if (!cartUser) {
      throw new apiError(400, "cart not found ");
    }
    return res
      .status(200)
      .json(new apiResponse(200, cartUser, "cart user find successfully"));
  } catch (error) {
    throw new apiError(400, "something went wrong");
  }
});

const removeItemFromCart = asyncHandler(async (req, res) => {
  const { product } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new apiError(400, "cart not found");
    }

    const itemIndex = cart.cartItem.findIndex(
      (item) => item.product.toString() === product.toString()
    );

    if (itemIndex === -1) {
      return res.status(400).json(new apiError(400, "item not found in cart"));
    }

    cart.cartItem.splice(itemIndex, 1);
    await cart.save();

    return res
      .status(200)
      .json(new apiResponse(200, cart, "cart item remove successfully"));
  } catch (error) {
    throw new apiError(400, "something went wrong");
  }
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new apiError(400, "cart not found");
    }

    cart.cartItem = [];

    await cart.save();
    return res
      .status(200)
      .json(new apiResponse(200, cart, "clear cart successfully"));
  } catch (error) {
    throw new apiError(400, "something went wrong");
  }
});

export { addItemToCart, getUserCart, removeItemFromCart, clearCart };

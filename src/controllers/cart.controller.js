import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price images');

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, weight } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].weight = weight;
    } else {
      cart.items.push({ productId, quantity, weight });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity, weight } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new ApiError(404, 'Item not found in cart');
    }

    item.quantity = quantity;
    if (weight) item.weight = weight;

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
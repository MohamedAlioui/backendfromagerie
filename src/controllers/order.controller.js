import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { generateOrderNumber } from '../utils/orderUtils.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod
    } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity * item.weight;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        weight: item.weight,
        price: product.price
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping and total
    const shippingCost = subtotal >= 100 ? 0 : 7;
    const total = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      subtotal,
      shippingCost,
      total
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort('-createdAt')
      .populate('items.productId', 'name images');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('items.productId', 'name images');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Only admin can update order status
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update order status');
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveryDate = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status !== 'pending') {
      throw new ApiError(400, 'Order cannot be cancelled');
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
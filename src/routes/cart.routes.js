import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all cart routes
router.use(protect);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update/:itemId', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

export default router;

import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import cartRoutes from './cart.routes.js';
import loyaltyRoutes from './loyalty.routes.js';
import recipeRoutes from './recipe.routes.js';
import reviewRoutes from './review.routes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/recipes', recipeRoutes);
router.use('/reviews', reviewRoutes);

export default router;
import express from 'express';
import { 
  createReview, 
  getProductReviews, 
  updateReview, 
  deleteReview,
  markHelpful 
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.use(protect);

// Create review
router.post('/', createReview);

// Update own review
router.put('/:id', updateReview);

// Delete own review
router.delete('/:id', deleteReview);

// Mark review as helpful
router.post('/:id/helpful', markHelpful);

export default router;

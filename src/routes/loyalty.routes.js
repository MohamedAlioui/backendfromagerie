import express from 'express';
import { 
  getLoyaltyPoints, 
  getLoyaltyHistory, 
  getLoyaltyTiers, 
  redeemPoints, 
  addPoints 
} from '../controllers/loyalty.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all loyalty routes
router.use(protect);

// Get user's loyalty points
router.get('/points', getLoyaltyPoints);

// Get loyalty history
router.get('/history', getLoyaltyHistory);

// Get loyalty tiers
router.get('/tiers', getLoyaltyTiers);

// Redeem points
router.post('/redeem', redeemPoints);

// Add points (typically called internally)
router.post('/add', addPoints);

export default router;

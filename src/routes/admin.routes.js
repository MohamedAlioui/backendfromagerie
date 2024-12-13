import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryStatus,
  getUserAnalytics
} from '../controllers/admin/dashboard.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/sales', getSalesAnalytics);
router.get('/dashboard/inventory', getInventoryStatus);
router.get('/dashboard/users', getUserAnalytics);

export default router;
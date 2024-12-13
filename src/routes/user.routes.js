import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  updatePreferences,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/user.controller.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.put('/preferences', updatePreferences);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;
import express from 'express';
import { 
  getRecipes, 
  getRecipeById, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe 
} from '../controllers/recipe.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getRecipes);
router.get('/:id', getRecipeById);

// Protected routes
router.use(protect);
router.use(authorize('admin')); // Only admins can manage recipes

router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;

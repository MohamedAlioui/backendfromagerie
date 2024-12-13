import { Recipe } from '../models/recipe.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadImage } from '../utils/cloudinary.js';

export const getRecipes = async (req, res, next) => {
  try {
    const { category, difficulty, sort } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    let recipes = Recipe.find(query);

    // Sorting
    if (sort) {
      switch (sort) {
        case 'prep-asc':
          recipes = recipes.sort('prepTime');
          break;
        case 'prep-desc':
          recipes = recipes.sort('-prepTime');
          break;
        case 'difficulty-asc':
          recipes = recipes.sort('difficulty');
          break;
        case 'difficulty-desc':
          recipes = recipes.sort('-difficulty');
          break;
      }
    }

    const result = await recipes.populate('author', 'name');

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name')
      .populate('ingredients.productId', 'name price images');

    if (!recipe) {
      throw new ApiError(404, 'Recipe not found');
    }

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to create recipes');
    }

    const imageUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadImage(file.path, 'recipes');
        imageUrls.push(result.secure_url);
      }
    }

    const recipe = await Recipe.create({
      ...req.body,
      author: req.user.id,
      images: imageUrls
    });

    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update recipes');
    }

    let recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      throw new ApiError(404, 'Recipe not found');
    }

    if (req.files) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadImage(file.path, 'recipes');
        imageUrls.push(result.secure_url);
      }
      req.body.images = imageUrls;
    }

    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete recipes');
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      throw new ApiError(404, 'Recipe not found');
    }

    await recipe.remove();

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, sort, isNew } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (isNew === 'true') {
      query.isNew = true;
    }

    let products = Product.find(query);

    // Sorting
    if (sort) {
      const sortOrder = sort === 'price-desc' ? -1 : 1;
      products = products.sort({ price: sortOrder });
    }

    const result = await products.exec();

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to create products');
    }

    const imageUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadImage(file.path, 'products');
        imageUrls.push(result.secure_url);
      }
    }

    const product = await Product.create({
      ...req.body,
      images: imageUrls
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update products');
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Handle image updates
    if (req.files) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadImage(file.path, 'products');
        imageUrls.push(result.secure_url);
      }
      req.body.images = imageUrls;

      // Delete old images
      for (const imageUrl of product.images) {
        await deleteImage(imageUrl);
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete products');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Delete product images
    for (const imageUrl of product.images) {
      await deleteImage(imageUrl);
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
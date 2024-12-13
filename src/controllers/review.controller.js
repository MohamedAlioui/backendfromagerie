import { Review } from '../models/review.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadImage } from '../utils/cloudinary.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });

    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this product');
    }

    // Handle image uploads
    const imageUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await uploadImage(file.path, 'reviews');
        imageUrls.push(result.secure_url);
      }
    }

    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating,
      comment,
      images: imageUrls
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      $push: { reviews: review._id }
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Verify review ownership
    if (review.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'Not authorized to update this review');
    }

    // Handle image uploads
    if (req.files) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadImage(file.path, 'reviews');
        imageUrls.push(result.secure_url);
      }
      req.body.images = imageUrls;
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update product rating
    const reviews = await Review.find({ productId: review.productId });
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(review.productId, {
      rating: averageRating
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Verify review ownership or admin role
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete this review');
    }

    await review.remove();

    // Update product rating
    const reviews = await Review.find({ productId: review.productId });
    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
      : 0;
    
    await Product.findByIdAndUpdate(review.productId, {
      rating: averageRating,
      $pull: { reviews: review._id }
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    review.helpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};
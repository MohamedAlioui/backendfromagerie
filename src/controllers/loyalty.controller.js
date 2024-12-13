import { Loyalty, LoyaltyTier } from '../models/loyalty.model.js';
import { ApiError } from '../utils/apiError.js';

export const getLoyaltyPoints = async (req, res, next) => {
  try {
    let loyalty = await Loyalty.findOne({ userId: req.user.id });
    
    if (!loyalty) {
      loyalty = await Loyalty.create({
        userId: req.user.id,
        points: 0,
        tier: 'bronze'
      });
    }

    res.status(200).json({
      success: true,
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyHistory = async (req, res, next) => {
  try {
    const loyalty = await Loyalty.findOne({ userId: req.user.id });
    if (!loyalty) {
      throw new ApiError(404, 'Loyalty record not found');
    }

    res.status(200).json({
      success: true,
      data: loyalty.history
    });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyTiers = async (req, res, next) => {
  try {
    const tiers = await LoyaltyTier.find({ isActive: true });

    res.status(200).json({
      success: true,
      data: tiers
    });
  } catch (error) {
    next(error);
  }
};

export const redeemPoints = async (req, res, next) => {
  try {
    const { points, description } = req.body;

    const loyalty = await Loyalty.findOne({ userId: req.user.id });
    if (!loyalty) {
      throw new ApiError(404, 'Loyalty record not found');
    }

    if (loyalty.points < points) {
      throw new ApiError(400, 'Insufficient points');
    }

    loyalty.points -= points;
    loyalty.history.push({
      type: 'redeem',
      points,
      description,
      createdAt: Date.now()
    });

    await loyalty.save();

    res.status(200).json({
      success: true,
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
};

export const addPoints = async (req, res, next) => {
  try {
    const { points, description, orderId } = req.body;

    const loyalty = await Loyalty.findOne({ userId: req.user.id });
    if (!loyalty) {
      throw new ApiError(404, 'Loyalty record not found');
    }

    loyalty.points += points;
    loyalty.history.push({
      type: 'earn',
      points,
      description,
      orderId,
      createdAt: Date.now()
    });

    // Update tier based on total points
    const tier = await LoyaltyTier.findOne({
      minPoints: { $lte: loyalty.points }
    }).sort('-minPoints');
    
    if (tier) {
      loyalty.tier = tier.name;
    }

    await loyalty.save();

    res.status(200).json({
      success: true,
      data: loyalty
    });
  } catch (error) {
    next(error);
  }
};
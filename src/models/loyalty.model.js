import mongoose from 'mongoose';

const loyaltyHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earn', 'redeem'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const loyaltySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  history: [loyaltyHistorySchema]
}, {
  timestamps: true
});

const loyaltyTierSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    required: true,
    unique: true
  },
  minPoints: {
    type: Number,
    required: true
  },
  multiplier: {
    type: Number,
    required: true,
    default: 1
  },
  benefits: [String],
  isActive: {
    type: Boolean,
    default: true
  }
});

export const Loyalty = mongoose.model('Loyalty', loyaltySchema);
export const LoyaltyTier = mongoose.model('LoyaltyTier', loyaltyTierSchema);
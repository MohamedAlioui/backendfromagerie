import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  addresses: [addressSchema],
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    orderNotifications: {
      type: Boolean,
      default: true
    },
    promotionalEmails: {
      type: Boolean,
      default: true
    }
  },
  favoriteProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

export const Profile = mongoose.model('Profile', profileSchema);
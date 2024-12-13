import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  images: [String],
  weight: {
    type: Number,
    required: [true, 'Product weight is required'],
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  isNew: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  ingredients: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number
  }
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
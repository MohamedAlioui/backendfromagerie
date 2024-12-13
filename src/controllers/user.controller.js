import { User } from '../models/user.model.js';
import { Profile } from '../models/profile.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadImage } from '../utils/cloudinary.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phoneNumber } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please upload an image');
    }

    const result = await uploadImage(req.file.path, 'avatars');
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { preferences },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (req.body.isDefault) {
      profile.addresses.forEach(addr => addr.isDefault = false);
    }
    
    profile.addresses.push(req.body);
    await profile.save();

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    const address = profile.addresses.id(req.params.addressId);

    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    if (req.body.isDefault) {
      profile.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, req.body);
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    profile.addresses.pull(req.params.addressId);
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};
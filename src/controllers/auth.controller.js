import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Profile } from '../models/profile.model.js';
import { ApiError } from '../utils/apiError.js';
import { emailService } from '../utils/email.js';
import { generateToken } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber,role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role
    });

    // Create profile
    await Profile.create({
      userId: user._id,
      preferences: {
        newsletter: true,
        orderNotifications: true,
        promotionalEmails: true
      }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'No user found with this email');
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    await emailService.sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: `Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};
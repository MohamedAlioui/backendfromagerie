import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/constants.js';

export const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const compareHash = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.SECRET);
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateSecurePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  return password;
};
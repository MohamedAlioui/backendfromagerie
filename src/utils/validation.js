import { body, param, query } from 'express-validator';

export const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères')
  ],
  login: [
    body('email').trim().isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ]
};

export const productValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom du produit doit contenir entre 2 et 100 caractères'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Le prix doit être un nombre positif'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('La catégorie est requise')
  ],
  update: [
    param('id').isMongoId().withMessage('ID de produit invalide'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Le prix doit être un nombre positif')
  ]
};

export const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('La commande doit contenir au moins un produit'),
    body('items.*.productId')
      .isMongoId()
      .withMessage('ID de produit invalide'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('La quantité doit être un nombre entier positif')
  ]
};
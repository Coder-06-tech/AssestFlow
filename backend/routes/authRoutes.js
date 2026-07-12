const express = require('express');
const router = Router = express.Router();

const authController = require('../controllers/authController');
const authGuard = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema
} = require('../utils/validationSchemas');

// Public routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google', validate(googleAuthSchema), authController.googleLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/me', authGuard, authController.me);
router.put('/profile', authGuard, authController.updateProfile);

module.exports = router;

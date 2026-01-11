import express from 'express';
import { forgotPassword, getMe, loginUser, logoutUser, registerUser, resetPassword, updateMyDetails, updateMyPassword } from '../controllers/auth.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router 
  .route('/me')
  .get(authenticate, getMe);

router
  .route('/me/details')
  .put(authenticate, updateMyDetails);

router
  .route('/me/password')
  .put(authenticate, updateMyPassword);

router
  .route('/login')
  .post(loginUser);

router
  .route('/register')
  .post(registerUser);

router
  .route('/forgotPassword')
  .post(forgotPassword);

router
  .route('/resetPassword/:resetToken')
  .put(resetPassword);

router
  .route('/logout')
  .get(authenticate, logoutUser);

export default router;

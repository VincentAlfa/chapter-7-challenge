import express from 'express';
import {
  login,
  register,
  resetPassword,
  sendEmailForgetPassword,
} from '../controller/auth-controller.js';
import { restrict } from '../middleware/jwt.js';
const routes = express.Router();

routes.post('/api/register', register);
routes.post('/api/login', login);
routes.post('/api/forget', sendEmailForgetPassword);
routes.post('/api/reset-password/:token', resetPassword);

routes.get('/register', (req, res) => {
  res.render('register');
});

routes.get('/login', (req, res) => {
  res.render('login');
});

routes.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

routes.get('/landing', restrict, (req, res) => {
  res.render('landing', { user: req.user });
});

routes.get('/forget', (req, res) => {
  res.render('forget');
});

routes.get('/reset-password/:token', (req, res) => {
  res.render('new_password', { user: req.user });
});

export default routes;

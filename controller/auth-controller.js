import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMail } from '../libs/nodemailer.js';
import { io } from '../app.js';
const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUserExist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (isUserExist) {
      return res.status(400).json({
        status: '400',
        message: 'User already registered please login',
        data: null,
      });
    }

    const hashPassword = bcrypt.hashSync(password, +process.env.SALT);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });

    io.emit('register', { msg: 'Register berhasil, harap login ' });

    res.redirect('/register');
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'internal server error',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: '400',
        message: 'User not found please login',
        data: null,
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 400,
        message: 'email or password invalid',
        data: null,
      });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);

    res.cookie('token', token, { httpOnly: true });
    res.redirect('/landing');
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'internal server error',
      error: error.message,
    });
  }
};

export const sendEmailForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: 'Email not found',
        data: null,
      });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);

    const message = `<div>
      <h1>Silahkan klik tautan dibawah untuk mengganti password</h1>
      <a href='http://localhost:3000/reset-password/${token}'>Reset Password</a>
    </div>`;

    sendMail(email, message);
    return res.status(200).json({
      status: 200,
      message: 'email sent',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: '500',
      message: 'internal server error',
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  let email;

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized',
      data: null,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized',
        data: null,
      });
    }
    email = decoded.email;
    req.user = decoded;
  });

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: 'user not found',
      data: null,
    });
  }

  const hashPassword = await bcrypt.hash(password, +process.env.SALT);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hashPassword,
    },
  });

  io.emit('change-password', { msg: 'Password berhasil diubah' });
  res.redirect(`/reset-password/${token}`);
};

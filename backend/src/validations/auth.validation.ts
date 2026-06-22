import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi',
  }),
  nama: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nama minimal 2 karakter',
    'string.max': 'Nama maksimal 100 karakter',
    'any.required': 'Nama wajib diisi',
  }),
  role: Joi.string().valid('SUPERADMIN', 'ADMIN', 'USER').default('USER'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi',
  }),
});

export const updateProfileSchema = Joi.object({
  nama: Joi.string().min(2).max(100),
  password: Joi.string().min(6),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// src/controllers/user.controller.js
import { userStore } from '../models/User.model.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validate } from '../utils/validation.js';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors.js';
import { commonSchemas } from '../utils/validation.js';
import logger from '../utils/logger.js';

const createUserSchema = z.object({
  email: commonSchemas.email,
  name: z.string().min(1).max(100),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: commonSchemas.email.optional(),
  role: z.enum(['user', 'admin']).optional(),
});

// Login schema
const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1),
});

export const userController = {
  // NEW: Login method
  login: asyncHandler(async (req, res) => {
    const { email, password } = validate(loginSchema, req.body);
    
    logger.info(`Login attempt for email: ${email}`, { requestId: req.requestId });

    // Find user by email
    const users = await userStore.findAll();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      logger.warn(`Failed login attempt - user not found: ${email}`, { requestId: req.requestId });
      return sendError(res, 'Invalid credentials', 401, req.requestId);  // Add req.requestId
    }

    // Check password (in real app, use bcrypt.compare)
    if (user.password !== password) {
      logger.warn(`Failed login attempt - wrong password for: ${email}`, { requestId: req.requestId });
      return sendError(res, 'Invalid credentials', 401, req.requestId);  // Add req.requestId
    }

    // Generate token (in real app, use JWT)
    const token = `mock_token_${user.id}_${user.role}`;
    
    logger.info(`Successful login for user: ${user.email}`, { 
      requestId: req.requestId, 
      userId: user.id,
      role: user.role 
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    sendSuccess(res, {
      user: userWithoutPassword,
      token: token
    }, 'Login successful', 200, req.requestId);  // Add req.requestId
  }),

  getAll: asyncHandler(async (req, res) => {  // Add req parameter
    const users = await userStore.findAll();
    sendSuccess(res, users, 'Users retrieved successfully', 200, req.requestId);  // Add req.requestId
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await userStore.findById(req.params.id);
    if (!user) throw new NotFoundError('User');
    sendSuccess(res, user, 'User retrieved successfully', 200, req.requestId);  // Add req.requestId
  }),

  create: asyncHandler(async (req, res) => {
    const data = validate(createUserSchema, req.body);
    const user = await userStore.create(data);
    if (!user) throw new ValidationError('Email already exists');
    sendSuccess(res, user, 'User created successfully', 201, req.requestId);  // Add req.requestId
  }),

  update: asyncHandler(async (req, res) => {
    const user = await userStore.update(req.params.id, validate(updateUserSchema, req.body));
    if (!user) throw new NotFoundError('User');
    sendSuccess(res, user, 'User updated successfully', 200, req.requestId);  // Add req.requestId
  }),

  delete: asyncHandler(async (req, res) => {
    const deleted = await userStore.delete(req.params.id);
    if (!deleted) throw new NotFoundError('User');
    sendSuccess(res, { id: req.params.id }, 'User deleted successfully', 200, req.requestId);  // Add req.requestId
  }),
};

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { NotFoundError, BadRequestError, UnauthenticatedError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';
import config from '../config';

// Helper function to create and send tokens
const createSendToken = (user: any, statusCode: number, res: Response) => {
  // Create token
  const token = user.createJWT();
  
  // Set cookie options
  const cookieOptions: any = {
    expires: new Date(
      Date.now() + (config.jwtExpiresIn.includes('d') ?
        parseInt(config.jwtExpiresIn) * 24 * 60 * 60 * 1000 :
        24 * 60 * 60 * 1000) // Default to 1 day if format is not in days
    ),
    httpOnly: true,
    secure: config.env === 'production',
  };
  
  // Remove password from output
  user.password = undefined;
  
  // Send response with cookie
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user,
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });
  
  logger.info(`User registered: ${user._id}`);
  
  // Create and send token
  createSendToken(user, StatusCodes.CREATED, res);
};

/**
 * @desc    Login user
 * @route   POST /api/v1/users/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  // Find user
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  
  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  
  logger.info(`User logged in: ${user._id}`);
  
  // Create and send token
  createSendToken(user, StatusCodes.OK, res);
};

/**
 * @desc    Logout user
 * @route   GET /api/v1/users/logout
 * @access  Private
 */
export const logout = async (req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User logged out successfully',
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthenticatedError('Not authenticated');
  }
  
  const user = await User.findById(req.user.userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response) => {
  const { name, email, address, phoneNumber } = req.body;
  
  // Create update object with only allowed fields
  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (address) updateData.address = address;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  
  if (!req.user) {
    throw new UnauthenticatedError('Not authenticated');
  }
  
  // Update user
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  logger.info(`User profile updated: ${user._id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
};

/**
 * @desc    Update user password
 * @route   PATCH /api/v1/users/update-password
 * @access  Private
 */
export const updatePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  // Check if passwords are provided
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Please provide current and new password');
  }
  
  if (!req.user) {
    throw new UnauthenticatedError('Not authenticated');
  }
  
  // Find user
  const user = await User.findById(req.user.userId).select('+password');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Check if current password is correct
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  logger.info(`User password updated: ${user._id}`);
  
  // Create and send token
  createSendToken(user, StatusCodes.OK, res);
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/me
 * @access  Private
 */
export const deleteAccount = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthenticatedError('Not authenticated');
  }
  
  await User.findByIdAndDelete(req.user.userId);
  
  logger.info(`User account deleted: ${req.user.userId}`);
  
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Account deleted successfully',
  });
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find().select('-password');
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: users.length,
    users,
  });
};

/**
 * @desc    Get user by ID (admin only)
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid user ID');
  }
  
  const user = await User.findById(id).select('-password');
  
  if (!user) {
    throw new NotFoundError(`No user found with id: ${id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
};

/**
 * @desc    Update user (admin only)
 * @route   PATCH /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid user ID');
  }
  
  // Create update object with only allowed fields
  const { name, email, role, isActive } = req.body;
  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  
  // Update user
  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    throw new NotFoundError(`No user found with id: ${id}`);
  }
  
  logger.info(`User updated by admin: ${id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
};

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid user ID');
  }
  
  const user = await User.findByIdAndDelete(id);
  
  if (!user) {
    throw new NotFoundError(`No user found with id: ${id}`);
  }
  
  logger.info(`User deleted by admin: ${id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User deleted successfully',
  });
};


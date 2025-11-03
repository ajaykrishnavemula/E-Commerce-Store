import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import { NotFoundError, BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';

/**
 * @desc    Get or create cart
 * @route   GET /api/v1/cart
 * @access  Public/Private
 */
export const getCart = async (req: any, res: any) => {
  let cart;
  
  if (req.user) {
    // Logged in user - find their cart
    cart = await Cart.findOne({ customer: req.user.userId });
    
    if (!cart) {
      // Create new cart for user
      cart = await Cart.create({
        customer: req.user.userId,
      });
    }
  } else {
    // Guest user - use session ID
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      // Create new cart for guest
      cart = await Cart.create({
        sessionId,
      });
    }
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    cart,
  });
};

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @access  Public/Private
 */
export const addItemToCart = async (req: any, res: any) => {
  const { productId, quantity, variantId } = req.body;
  
  // Validate input
  if (!productId || !quantity || quantity < 1) {
    throw new BadRequestError('Product ID and quantity are required');
  }
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new BadRequestError('Invalid product ID');
  }
  
  // Get or create cart
  let cart;
  
  if (req.user) {
    // Logged in user - find their cart
    cart = await Cart.findOne({ customer: req.user.userId });
    
    if (!cart) {
      // Create new cart for user
      cart = await Cart.create({
        customer: req.user.userId,
      });
    }
  } else {
    // Guest user - use session ID
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      // Create new cart for guest
      cart = await Cart.create({
        sessionId,
      });
    }
  }
  
  // Add item to cart
  await cart.addItem(productId, quantity, variantId);
  
  // Refresh cart from database
  cart = await Cart.findById(cart._id);
  
  if (cart) {
    logger.info(`Item added to cart: ${cart._id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    cart,
  });
};

/**
 * @desc    Update cart item quantity
 * @route   PATCH /api/v1/cart/items/:itemId
 * @access  Public/Private
 */
export const updateCartItem = async (req: any, res: any) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  
  // Validate input
  if (!quantity || quantity < 0) {
    throw new BadRequestError('Valid quantity is required');
  }
  
  // Get cart
  let cart;
  
  if (req.user) {
    cart = await Cart.findOne({ customer: req.user.userId });
  } else {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
  }
  
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }
  
  // Update item quantity
  await cart.updateItemQuantity(itemId, quantity);
  
  // Refresh cart from database
  cart = await Cart.findById(cart._id);
  
  logger.info(`Cart item updated: ${itemId}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    cart,
  });
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:itemId
 * @access  Public/Private
 */
export const removeCartItem = async (req: any, res: any) => {
  const { itemId } = req.params;
  
  // Get cart
  let cart;
  
  if (req.user) {
    cart = await Cart.findOne({ customer: req.user.userId });
  } else {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
  }
  
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }
  
  // Remove item from cart
  await cart.removeItem(itemId);
  
  // Refresh cart from database
  cart = await Cart.findById(cart._id);
  
  logger.info(`Item removed from cart: ${itemId}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    cart,
  });
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Public/Private
 */
export const clearCart = async (req: any, res: any) => {
  // Get cart
  let cart;
  
  if (req.user) {
    cart = await Cart.findOne({ customer: req.user.userId });
  } else {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
  }
  
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }
  
  // Clear cart
  await cart.clearCart();
  
  logger.info(`Cart cleared: ${cart._id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cart cleared successfully',
    cart,
  });
};

/**
 * @desc    Apply discount code to cart
 * @route   POST /api/v1/cart/discount
 * @access  Public/Private
 */
export const applyDiscount = async (req: any, res: any) => {
  const { code } = req.body;
  
  if (!code) {
    throw new BadRequestError('Discount code is required');
  }
  
  // Get cart
  let cart;
  
  if (req.user) {
    cart = await Cart.findOne({ customer: req.user.userId });
  } else {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
  }
  
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }
  
  // Apply discount
  try {
    await cart.applyDiscount(code);
    
    // Refresh cart from database
    cart = await Cart.findById(cart._id);
    
    logger.info(`Discount applied to cart: ${code}`);
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Discount applied successfully',
      cart,
    });
  } catch (error: any) {
    throw new BadRequestError(error.message || 'Invalid discount code');
  }
};

/**
 * @desc    Set shipping method for cart
 * @route   POST /api/v1/cart/shipping
 * @access  Public/Private
 */
export const setShippingMethod = async (req: any, res: any) => {
  const { methodId } = req.body;
  
  if (!methodId) {
    throw new BadRequestError('Shipping method ID is required');
  }
  
  // Get cart
  let cart;
  
  if (req.user) {
    cart = await Cart.findOne({ customer: req.user.userId });
  } else {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required for guest cart');
    }
    
    cart = await Cart.findOne({ sessionId });
  }
  
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }
  
  // Set shipping method
  try {
    await cart.setShippingMethod(methodId);
    
    // Refresh cart from database
    cart = await Cart.findById(cart._id);
    
    logger.info(`Shipping method set for cart: ${methodId}`);
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Shipping method set successfully',
      cart,
    });
  } catch (error: any) {
    throw new BadRequestError(error.message || 'Invalid shipping method');
  }
};

/**
 * @desc    Merge guest cart with user cart on login
 * @route   POST /api/v1/cart/merge
 * @access  Private
 */
export const mergeCart = async (req: any, res: any) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    throw new BadRequestError('Session ID is required');
  }
  
  // Find guest cart
  const guestCart = await Cart.findOne({ sessionId });
  
  if (!guestCart || !guestCart.items.length) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'No guest cart to merge',
    });
  }
  
  // Find or create user cart
  if (!req.user) {
    throw new BadRequestError('Authentication required');
  }
  
  let userCart = await Cart.findOne({ customer: req.user.userId });
  
  if (!userCart) {
    userCart = await Cart.create({
      customer: req.user.userId,
    });
  }
  
  // Merge items from guest cart to user cart
  for (const item of guestCart.items) {
    await userCart.addItem(
      item.product.toString(),
      item.quantity,
      item.variant?.id
    );
  }
  
  // Apply discount if any
  if (guestCart.discount && guestCart.discountCode) {
    try {
      await userCart.applyDiscount(guestCart.discountCode);
    } catch (error: any) {
      logger.error(`Failed to apply discount during cart merge: ${error.message}`);
    }
  }
  
  // Apply shipping method if any
  if (guestCart.shippingMethod && guestCart.shippingMethod.id) {
    try {
      await userCart.setShippingMethod(guestCart.shippingMethod.id);
    } catch (error: any) {
      logger.error(`Failed to set shipping method during cart merge: ${error.message}`);
    }
  }
  
  // Delete guest cart
  await Cart.findByIdAndDelete(guestCart._id);
  
  // Refresh user cart from database
  userCart = await Cart.findById(userCart._id);
  
  if (userCart) {
    logger.info(`Carts merged: ${guestCart._id} -> ${userCart._id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Carts merged successfully',
    cart: userCart,
  });
};


import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { NotFoundError, BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';

/**
 * @desc    Create a new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req: Request, res: Response) => {
  const { 
    cartId, 
    shippingAddress, 
    paymentMethod,
    shippingMethod,
    notes 
  } = req.body;
  
  // Validate cart ID
  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    throw new BadRequestError('Invalid cart ID');
  }
  
  // Find cart
  const cart = await Cart.findById(cartId);
  
  if (!cart) {
    throw new NotFoundError(`No cart found with id: ${cartId}`);
  }
  
  // Verify cart belongs to user
  if (!req.user) {
    throw new BadRequestError('Authentication required');
  }
  
  if (cart.customer && cart.customer.toString() !== req.user.userId) {
    throw new BadRequestError('Cart does not belong to this user');
  }
  
  // Check if cart has items
  if (!cart.items || cart.items.length === 0) {
    throw new BadRequestError('Cannot create order with empty cart');
  }
  
  // Check inventory for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new NotFoundError(`Product not found: ${item.product}`);
    }
    
    if (!product.isActive) {
      throw new BadRequestError(`Product is no longer available: ${product.name}`);
    }
    
    // Check inventory
    let inventory;
    if (item.variant && item.variant.id) {
      const variants = product.variants || [];
      const variant = variants.find((v: any) => v._id && v._id.toString() === item.variant?.id);
      if (!variant) {
        throw new NotFoundError(`Variant not found for product: ${product.name}`);
      }
      inventory = variant.inventory;
    } else {
      inventory = product.inventory;
    }
    
    if (inventory < item.quantity) {
      throw new BadRequestError(`Not enough inventory for ${product.name}. Available: ${inventory}`);
    }
  }
  
  // Create order items from cart items
  const orderItems = cart.items.map(item => ({
    product: item.product,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    variant: item.variant,
    image: item.image,
    sku: item.sku,
  }));
  
  // Create order
  // Generate order number
  const orderNumber = await Order.generateOrderNumber();

  // Create payment object
  const payment = {
    method: paymentMethod,
    status: 'pending',
    amount: cart.total,
    currency: 'USD',
  };

  const order = await Order.create({
    orderNumber,
    customer: req.user.userId,
    email: req.user.email,
    items: orderItems.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    })),
    billingAddress: shippingAddress, // Using shipping address as billing address
    shippingAddress,
    payment,
    shippingMethod: {
      name: shippingMethod.name,
      carrier: shippingMethod.carrier,
      price: shippingMethod.price,
      estimatedDelivery: shippingMethod.estimatedDelivery
    },
    subtotal: cart.subtotal,
    shippingCost: shippingMethod.price,
    tax: cart.tax,
    discount: cart.discount,
    total: cart.total,
    currency: 'USD',
    notes,
  });
  
  // Update inventory for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    
    if (product) {
      if (item.variant && item.variant.id) {
        const variants = product.variants || [];
        const variantIndex = variants.findIndex((v: any) => v._id && v._id.toString() === item.variant?.id);
        if (variantIndex !== -1 && product.variants) {
          product.variants[variantIndex].inventory -= item.quantity;
        }
      } else {
        product.inventory -= item.quantity;
      }
      
      await product.save();
    }
  }
  
  // Clear the cart
  await cart.clearCart();
  
  logger.info(`Order created: ${order._id}`);
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    order,
  });
};

/**
 * @desc    Get all orders for current user
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getUserOrders = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new BadRequestError('Authentication required');
  }
  
  const orders = await Order.find({ customer: req.user.userId })
    .sort('-createdAt');
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: orders.length,
    orders,
  });
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid order ID');
  }
  
  const order = await Order.findById(id);
  
  if (!order) {
    throw new NotFoundError(`No order found with id: ${id}`);
  }
  
  // Check if order belongs to user or user is admin
  if (!req.user) {
    throw new BadRequestError('Authentication required');
  }
  
  if (order.customer.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new BadRequestError('Not authorized to access this order');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    order,
  });
};

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid order ID');
  }
  
  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  const order = await Order.findById(id);
  
  if (!order) {
    throw new NotFoundError(`No order found with id: ${id}`);
  }
  
  // Update status
  order.status = status;
  
  // If order is cancelled, restore inventory
  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      
      if (product) {
        if (item.variant && item.variant.id) {
          const variants = product.variants || [];
          const variantIndex = variants.findIndex((v: any) => v._id && v._id.toString() === item.variant?.id);
          if (variantIndex !== -1 && product.variants) {
            product.variants[variantIndex].inventory += item.quantity;
          }
        } else {
          product.inventory += item.quantity;
        }
        
        await product.save();
      }
    }
  }
  
  await order.save();
  
  logger.info(`Order status updated: ${id} -> ${status}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    order,
  });
};

/**
 * @desc    Get all orders (admin only)
 * @route   GET /api/v1/orders/admin
 * @access  Private/Admin
 */
export const getAllOrders = async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  // Build query
  const queryObject: Record<string, any> = {};
  
  // Filter by status
  if (status) {
    queryObject.status = status;
  }
  
  // Pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  
  const orders = await Order.find(queryObject)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum)
    .populate('customer', 'name email');
  
  // Get total count for pagination info
  const totalOrders = await Order.countDocuments(queryObject);
  const totalPages = Math.ceil(totalOrders / limitNum);
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: orders.length,
    totalOrders,
    totalPages,
    currentPage: pageNum,
    orders,
  });
};

/**
 * @desc    Get order statistics (admin only)
 * @route   GET /api/v1/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = async (req: Request, res: Response) => {
  // Get total orders
  const totalOrders = await Order.countDocuments();
  
  // Get orders by status
  const statusCounts = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
      },
    },
  ]);
  
  // Format status counts
  const ordersByStatus = statusCounts.reduce((acc: Record<string, { count: number, total: number }>, curr: { _id: string; count: number; total: number }) => {
    acc[curr._id] = {
      count: curr.count,
      total: curr.total,
    };
    return acc;
  }, {});
  
  // Get total revenue
  const revenue = await Order.aggregate([
    {
      $match: {
        status: { $nin: ['cancelled', 'refunded'] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
      },
    },
  ]);
  
  // Get recent orders
  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(5)
    .populate('customer', 'name email');
  
  res.status(StatusCodes.OK).json({
    success: true,
    stats: {
      totalOrders,
      ordersByStatus,
      revenue: revenue.length > 0 ? revenue[0].total : 0,
      recentOrders,
    },
  });
};


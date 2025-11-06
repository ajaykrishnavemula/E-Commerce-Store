import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';
import Review from '../models/Review';
import { logger } from '../utils/logger';

/**
 * Get dashboard statistics
 * @route GET /api/v1/admin/dashboard
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can access dashboard statistics'
      });
    }
    
    // Get counts
    const [
      productCount,
      orderCount,
      userCount,
      pendingReviewCount,
      lowStockCount,
      totalRevenue,
      recentOrders,
      topSellingProducts
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Product.countDocuments({ inventory: { $lt: 10 } }),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            _id: 0,
            product: { _id: 1, name: 1, price: 1, images: 1 },
            totalSold: 1
          }
        }
      ])
    ]);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      stats: {
        productCount,
        orderCount,
        userCount,
        pendingReviewCount,
        lowStockCount,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentOrders,
        topSellingProducts
      }
    });
  } catch (error) {
    logger.error('Error in getDashboardStats:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting dashboard statistics',
      error: (error as Error).message
    });
  }
};

/**
 * Get sales analytics
 * @route GET /api/v1/admin/analytics/sales
 */
export const getSalesAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can access sales analytics'
      });
    }
    
    const { period = 'monthly' } = req.query;
    
    let groupBy: Record<string, any>;
    let sortBy: Record<string, 1 | -1>;
    
    // Set grouping based on period
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.week': 1 };
        break;
      case 'monthly':
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.month': 1 };
        break;
    }
    
    // Get sales data
    const salesData = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: sortBy }
    ]);
    
    // Format data for frontend
    const formattedData = salesData.map((item: {
      _id: {
        year?: number;
        month?: number;
        day?: number;
        week?: number;
      };
      totalSales: number;
      orderCount: number
    }) => {
      let label = '';
      
      if (period === 'daily') {
        label = `${item._id.year}-${item._id.month}-${item._id.day}`;
      } else if (period === 'weekly') {
        label = `${item._id.year}-W${item._id.week}`;
      } else {
        label = `${item._id.year}-${item._id.month}`;
      }
      
      return {
        label,
        totalSales: item.totalSales,
        orderCount: item.orderCount
      };
    });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      period,
      data: formattedData
    });
  } catch (error) {
    logger.error('Error in getSalesAnalytics:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting sales analytics',
      error: (error as Error).message
    });
  }
};

/**
 * Get product analytics
 * @route GET /api/v1/admin/analytics/products
 */
export const getProductAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can access product analytics'
      });
    }
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          product: { _id: 1, name: 1, price: 1, images: 1 },
          totalSold: 1,
          revenue: { $multiply: ['$totalSold', '$product.price'] }
        }
      }
    ]);
    
    // Get category distribution
    const categoryDistribution = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $unwind: '$product.categories' },
      { $group: { _id: '$product.categories', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get inventory status
    const inventoryStatus = await Product.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $lt: ['$inventory', 5] },
              then: 'Critical',
              else: {
                $cond: {
                  if: { $lt: ['$inventory', 10] },
                  then: 'Low',
                  else: {
                    $cond: {
                      if: { $lt: ['$inventory', 20] },
                      then: 'Moderate',
                      else: 'Good'
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      topSellingProducts,
      categoryDistribution,
      inventoryStatus
    });
  } catch (error) {
    logger.error('Error in getProductAnalytics:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting product analytics',
      error: (error as Error).message
    });
  }
};

/**
 * Get user analytics
 * @route GET /api/v1/admin/analytics/users
 */
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can access user analytics'
      });
    }
    
    // Get user registration over time
    const userRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get top customers by order value
    const topCustomers = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: '$customer', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: { _id: 1, name: 1, email: 1 },
          totalSpent: 1,
          orderCount: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$orderCount'] }
        }
      }
    ]);
    
    // Format user registrations for frontend
    const formattedRegistrations = userRegistrations.map(item => ({
      label: `${item._id.year}-${item._id.month}`,
      count: item.count
    }));
    
    return res.status(StatusCodes.OK).json({
      success: true,
      userRegistrations: formattedRegistrations,
      topCustomers
    });
  } catch (error) {
    logger.error('Error in getUserAnalytics:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting user analytics',
      error: (error as Error).message
    });
  }
};


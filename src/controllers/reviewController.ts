import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Product from '../models/Product';
import { logger } from '../utils/logger';
import { IReviewDocument } from '../interfaces/Review';

/**
 * Create a new product review
 * @route POST /api/v1/reviews
 */
export const createReview = async (req: Request, res: Response) => {
  try {
    const { product: productId, rating, title, comment, images } = req.body;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user!.userId
    });
    
    if (existingReview) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No product found with id ${productId}`
      });
    }
    
    // Check if user has purchased the product (for verified purchase badge)
    // This would require checking order history
    // For now, we'll set it to false and implement this later
    const isVerifiedPurchase = false;
    
    // Create review
    const review = await Review.create({
      product: productId,
      user: req.user!.userId,
      rating,
      title,
      comment,
      isVerifiedPurchase,
      images,
      status: 'pending', // All reviews start as pending
      helpfulVotes: 0,
      notHelpfulVotes: 0
    });
    
    return res.status(StatusCodes.CREATED).json({
      success: true,
      review
    });
  } catch (error) {
    logger.error('Error in createReview:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error creating review',
      error: (error as Error).message
    });
  }
};

/**
 * Get all reviews for a product
 * @route GET /api/v1/reviews/product/:productId
 */
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '10', sort = 'newest' } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Build query
    const query: any = { 
      product: productId,
      status: 'approved' // Only show approved reviews to regular users
    };
    
    // Admins can see all reviews
    if (req.user?.role === 'admin') {
      delete query.status;
    }
    
    // Get sort options
    const sortOptions = getReviewSortOptions(sort as string);
    
    // Execute query
    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    const total = await Review.countDocuments(query);
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      reviews,
      ratingDistribution
    });
  } catch (error) {
    logger.error('Error in getProductReviews:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting product reviews',
      error: (error as Error).message
    });
  }
};

/**
 * Get all reviews by a user
 * @route GET /api/v1/reviews/user/:userId
 */
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Check if user is requesting their own reviews or is an admin
    if (req.user!.userId !== userId && req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only view your own reviews'
      });
    }
    
    // Execute query
    const reviews = await Review.find({ user: userId })
      .populate('product', 'name images price')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    const total = await Review.countDocuments({ user: userId });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      reviews
    });
  } catch (error) {
    logger.error('Error in getUserReviews:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting user reviews',
      error: (error as Error).message
    });
  }
};

/**
 * Update a review
 * @route PATCH /api/v1/reviews/:id
 */
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No review found with id ${id}`
      });
    }
    
    // Check if user owns the review or is an admin
    if (review.user.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }
    
    // Check if review is editable (within 30 days)
    const reviewDoc = review as unknown as IReviewDocument;
    if (!reviewDoc.isEditable() && req.user!.role !== 'admin') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Reviews can only be edited within 30 days of creation'
      });
    }
    
    // Update review
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    
    // If user is updating their review, set status back to pending
    if (req.user!.role !== 'admin') {
      review.status = 'pending';
    }
    
    await review.save();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      review
    });
  } catch (error) {
    logger.error('Error in updateReview:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error updating review',
      error: (error as Error).message
    });
  }
};

/**
 * Delete a review
 * @route DELETE /api/v1/reviews/:id
 */
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No review found with id ${id}`
      });
    }
    
    // Check if user owns the review or is an admin
    if (review.user.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }
    
    await review.remove();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteReview:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error deleting review',
      error: (error as Error).message
    });
  }
};

/**
 * Approve or reject a review (admin only)
 * @route PATCH /api/v1/reviews/:id/moderate
 */
export const moderateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can moderate reviews'
      });
    }
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No review found with id ${id}`
      });
    }
    
    // Update status
    review.status = status;
    
    // If rejecting, add reason
    if (status === 'rejected' && rejectionReason) {
      review.rejectionReason = rejectionReason;
    }
    
    await review.save();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      review
    });
  } catch (error) {
    logger.error('Error in moderateReview:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error moderating review',
      error: (error as Error).message
    });
  }
};

/**
 * Vote on a review (helpful/not helpful)
 * @route POST /api/v1/reviews/:id/vote
 */
export const voteOnReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;
    
    if (vote !== 'helpful' && vote !== 'not_helpful') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Vote must be either "helpful" or "not_helpful"'
      });
    }
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No review found with id ${id}`
      });
    }
    
    // Update vote count
    if (vote === 'helpful') {
      review.helpfulVotes += 1;
    } else {
      review.notHelpfulVotes += 1;
    }
    
    await review.save();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulVotes: review.helpfulVotes,
      notHelpfulVotes: review.notHelpfulVotes
    });
  } catch (error) {
    logger.error('Error in voteOnReview:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error voting on review',
      error: (error as Error).message
    });
  }
};

/**
 * Get pending reviews (admin only)
 * @route GET /api/v1/reviews/pending
 */
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can view pending reviews'
      });
    }
    
    const { page = '1', limit = '20' } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    
    // Execute query
    const reviews = await Review.find({ status: 'pending' })
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: 1 }) // Oldest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    const total = await Review.countDocuments({ status: 'pending' });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      reviews
    });
  } catch (error) {
    logger.error('Error in getPendingReviews:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting pending reviews',
      error: (error as Error).message
    });
  }
};

/**
 * Get sort options for reviews
 * @param sort Sort parameter
 */
const getReviewSortOptions = (sort: string): Record<string, 1 | -1> => {
  switch (sort) {
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'highest_rating':
      return { rating: -1 };
    case 'lowest_rating':
      return { rating: 1 };
    case 'most_helpful':
      return { helpfulVotes: -1 };
    default:
      return { createdAt: -1 };
  }
};


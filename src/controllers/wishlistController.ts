import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { logger } from '../utils/logger';
import { IWishlistDocument } from '../interfaces/Wishlist';

/**
 * Create a new wishlist
 * @route POST /api/v1/wishlists
 */
export const createWishlist = async (req: Request, res: Response) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const wishlist = await Wishlist.create({
      user: req.user!.userId,
      name,
      description,
      isPublic: isPublic || false,
      items: []
    });
    
    return res.status(StatusCodes.CREATED).json({
      success: true,
      wishlist
    });
  } catch (error) {
    logger.error('Error in createWishlist:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error creating wishlist',
      error: (error as Error).message
    });
  }
};

/**
 * Get all wishlists for the current user
 * @route GET /api/v1/wishlists
 */
export const getUserWishlists = async (req: Request, res: Response) => {
  try {
    const wishlists = await Wishlist.find({ user: req.user!.userId })
      .sort({ updatedAt: -1 });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: wishlists.length,
      wishlists
    });
  } catch (error) {
    logger.error('Error in getUserWishlists:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting wishlists',
      error: (error as Error).message
    });
  }
};

/**
 * Get a single wishlist by ID
 * @route GET /api/v1/wishlists/:id
 */
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const wishlist = await Wishlist.findById(id)
      .populate('items.product', 'name description price images inventory');
    
    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No wishlist found with id ${id}`
      });
    }
    
    // Check if user has permission to view this wishlist
    if (wishlist.user.toString() !== req.user!.userId && !wishlist.isPublic) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to view this wishlist'
      });
    }
    
    return res.status(StatusCodes.OK).json({
      success: true,
      wishlist
    });
  } catch (error) {
    logger.error('Error in getWishlist:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting wishlist',
      error: (error as Error).message
    });
  }
};

/**
 * Update a wishlist
 * @route PATCH /api/v1/wishlists/:id
 */
export const updateWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    
    const wishlist = await Wishlist.findById(id);
    
    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No wishlist found with id ${id}`
      });
    }
    
    // Check if user owns the wishlist
    if (wishlist.user.toString() !== req.user!.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only update your own wishlists'
      });
    }
    
    // Update fields
    if (name) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;
    if (isPublic !== undefined) wishlist.isPublic = isPublic;
    
    await wishlist.save();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      wishlist
    });
  } catch (error) {
    logger.error('Error in updateWishlist:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error updating wishlist',
      error: (error as Error).message
    });
  }
};

/**
 * Delete a wishlist
 * @route DELETE /api/v1/wishlists/:id
 */
export const deleteWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const wishlist = await Wishlist.findById(id);
    
    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No wishlist found with id ${id}`
      });
    }
    
    // Check if user owns the wishlist
    if (wishlist.user.toString() !== req.user!.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only delete your own wishlists'
      });
    }
    
    await wishlist.remove();
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Wishlist deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteWishlist:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error deleting wishlist',
      error: (error as Error).message
    });
  }
};

/**
 * Add an item to a wishlist
 * @route POST /api/v1/wishlists/:id/items
 */
export const addItemToWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { productId, notes } = req.body;
    
    if (!productId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Product ID is required'
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
    
    const wishlist = await Wishlist.findById(id);
    
    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No wishlist found with id ${id}`
      });
    }
    
    // Check if user owns the wishlist
    if (wishlist.user.toString() !== req.user!.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only add items to your own wishlists'
      });
    }
    
    // Add item to wishlist
    const wishlistDoc = wishlist as unknown as IWishlistDocument;
    await wishlistDoc.addItem(new mongoose.Types.ObjectId(productId), notes);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Item added to wishlist',
      wishlist: wishlistDoc
    });
  } catch (error) {
    logger.error('Error in addItemToWishlist:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error adding item to wishlist',
      error: (error as Error).message
    });
  }
};

/**
 * Remove an item from a wishlist
 * @route DELETE /api/v1/wishlists/:id/items/:productId
 */
export const removeItemFromWishlist = async (req: Request, res: Response) => {
  try {
    const { id, productId } = req.params;
    
    const wishlist = await Wishlist.findById(id);
    
    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No wishlist found with id ${id}`
      });
    }
    
    // Check if user owns the wishlist
    if (wishlist.user.toString() !== req.user!.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You can only remove items from your own wishlists'
      });
    }
    
    // Remove item from wishlist
    const wishlistDoc = wishlist as unknown as IWishlistDocument;
    await wishlistDoc.removeItem(new mongoose.Types.ObjectId(productId));
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist: wishlistDoc
    });
  } catch (error) {
    logger.error('Error in removeItemFromWishlist:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error removing item from wishlist',
      error: (error as Error).message
    });
  }
};

/**
 * Get all public wishlists
 * @route GET /api/v1/wishlists/public
 */
export const getPublicWishlists = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Get public wishlists
    const wishlists = await Wishlist.find({ isPublic: true })
      .populate('user', 'name')
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    const total = await Wishlist.countDocuments({ isPublic: true });
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: wishlists.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      wishlists
    });
  } catch (error) {
    logger.error('Error in getPublicWishlists:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting public wishlists',
      error: (error as Error).message
    });
  }
};

/**
 * Check if a product is in any of the user's wishlists
 * @route GET /api/v1/wishlists/check/:productId
 */
export const checkProductInWishlists = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    // Find all wishlists that contain the product
    const wishlists = await Wishlist.find({
      user: req.user!.userId,
      'items.product': new mongoose.Types.ObjectId(productId)
    }).select('_id name');
    
    return res.status(StatusCodes.OK).json({
      success: true,
      inWishlists: wishlists.length > 0,
      wishlists
    });
  } catch (error) {
    logger.error('Error in checkProductInWishlists:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error checking product in wishlists',
      error: (error as Error).message
    });
  }
};

/**
 * Create a default wishlist for a new user
 * @param userId User ID
 */
export const createDefaultWishlist = async (userId: string): Promise<void> => {
  try {
    await Wishlist.createDefaultWishlist(new mongoose.Types.ObjectId(userId));
    logger.info(`Created default wishlist for user ${userId}`);
  } catch (error) {
    logger.error(`Error creating default wishlist for user ${userId}:`, error);
  }
};


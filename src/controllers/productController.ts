import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import { NotFoundError, BadRequestError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../utils/logger';

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = async (req: Request, res: Response) => {
  // Add the user ID as the creator
  if (!req.user) {
    throw new BadRequestError('Authentication required');
  }
  req.body.createdBy = req.user.userId;
  
  const product = await Product.create(req.body);
  
  logger.info(`Product created: ${product._id}`);
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    product,
  });
};

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getAllProducts = async (req: Request, res: Response) => {
  const { 
    name, 
    category, 
    featured, 
    sort, 
    fields, 
    numericFilters,
    page = 1, 
    limit = 10 
  } = req.query;
  
  // Build query
  const queryObject: any = { isActive: true };
  
  // Filter by name
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }
  
  // Filter by category
  if (category) {
    queryObject.category = category;
  }
  
  // Filter by featured
  if (featured) {
    queryObject.featured = featured === 'true';
  }
  
  // Numeric filters
  if (numericFilters) {
    const operatorMap: { [key: string]: string } = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    
    const regEx = /\b(<|>|>=|=|<=)\b/g;
    let filters = (numericFilters as string).replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    
    const options = ['price', 'rating', 'inventory'];
    filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }
  
  // Execute query
  let result = Product.find(queryObject);
  
  // Sort
  if (sort) {
    const sortList = (sort as string).split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('createdAt');
  }
  
  // Select fields
  if (fields) {
    const fieldsList = (fields as string).split(',').join(' ');
    result = result.select(fieldsList);
  }
  
  // Pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  
  result = result.skip(skip).limit(limitNum);
  
  // Execute query
  const products = await result;
  
  // Get total count for pagination info
  const totalProducts = await Product.countDocuments(queryObject);
  const totalPages = Math.ceil(totalProducts / limitNum);
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages,
    currentPage: pageNum,
    products,
  });
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid product ID');
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    throw new NotFoundError(`No product found with id: ${id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    product,
  });
};

/**
 * @desc    Update product
 * @route   PATCH /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid product ID');
  }
  
  // Find and update the product
  const product = await Product.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!product) {
    throw new NotFoundError(`No product found with id: ${id}`);
  }
  
  logger.info(`Product updated: ${id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    product,
  });
};

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid product ID');
  }
  
  const product = await Product.findByIdAndDelete(id);
  
  if (!product) {
    throw new NotFoundError(`No product found with id: ${id}`);
  }
  
  logger.info(`Product deleted: ${id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Product deleted successfully',
  });
};

/**
 * @desc    Get featured products
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  
  const products = await Product.find({ featured: true, isActive: true })
    .limit(limit)
    .sort('-createdAt');
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    products,
  });
};

/**
 * @desc    Search products
 * @route   GET /api/v1/products/search
 * @access  Public
 */
export const searchProducts = async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q) {
    throw new BadRequestError('Search query is required');
  }
  
  const products = await Product.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q as string, 'i')] } },
        ],
      },
    ],
  }).limit(20);
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: products.length,
    products,
  });
};

/**
 * @desc    Get product categories
 * @route   GET /api/v1/products/categories
 * @access  Public
 */
export const getProductCategories = async (req: Request, res: Response) => {
  const categories = await Product.distinct('category');
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: categories.length,
    categories,
  });
};

/**
 * @desc    Add product review
 * @route   POST /api/v1/products/:id/reviews
 * @access  Private
 */
export const addProductReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid product ID');
  }
  
  // Find product
  const product = await Product.findById(id);
  
  if (!product) {
    throw new NotFoundError(`No product found with id: ${id}`);
  }
  
  // Check if user already reviewed this product
  const reviews = product.reviews || [];
  if (!req.user) {
    throw new BadRequestError('Authentication required');
  }
  
  const userId = req.user.userId;
  const alreadyReviewed = reviews.find(
    (review) => review.userId.toString() === userId
  );
  
  if (alreadyReviewed) {
    throw new BadRequestError('You have already reviewed this product');
  }
  
  // Create review
  const review = {
    userId: new mongoose.Types.ObjectId(req.user.userId),
    rating: Number(rating),
    title: req.user.name || 'Anonymous', // Using name as title
    comment,
    isVerifiedPurchase: false, // Default value
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add review to product
  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(review);
  
  // Update product rating
  if (!product.rating) {
    product.rating = { average: 0, count: 0 };
  }
  
  // Calculate average rating
  product.rating.count = product.reviews.length;
  product.rating.average =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;
  
  // Save product
  await product.save();
  
  logger.info(`Review added to product: ${id}`);
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Review added successfully',
  });
};

/**
 * @desc    Update product inventory
 * @route   PATCH /api/v1/products/:id/inventory
 * @access  Private/Admin
 */
export const updateProductInventory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { inventory } = req.body;
  
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid product ID');
  }
  
  // Validate inventory
  if (inventory === undefined || inventory < 0) {
    throw new BadRequestError('Invalid inventory value');
  }
  
  // Find and update the product
  const product = await Product.findByIdAndUpdate(
    id,
    { inventory },
    { new: true, runValidators: true }
  );
  
  if (!product) {
    throw new NotFoundError(`No product found with id: ${id}`);
  }
  
  logger.info(`Product inventory updated: ${id}`);
  
  res.status(StatusCodes.OK).json({
    success: true,
    product,
  });
};


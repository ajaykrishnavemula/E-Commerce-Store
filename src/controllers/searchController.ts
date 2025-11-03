import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Product from '../models/Product';
import elasticsearchService from '../services/elasticsearch.service';
import { logger } from '../utils/logger';

/**
 * Search products with advanced filtering and sorting
 * @route GET /api/v1/search/products
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { 
      query, 
      categories, 
      tags, 
      brand, 
      minPrice, 
      maxPrice, 
      inStock, 
      sort, 
      page = '1', 
      limit = '10',
      showInactive
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    // Prepare filters
    const filters: Record<string, any> = {};
    
    if (categories) {
      filters.categories = Array.isArray(categories) 
        ? categories 
        : [categories];
    }
    
    if (tags) {
      filters.tags = Array.isArray(tags) 
        ? tags 
        : [tags];
    }
    
    if (brand) filters.brand = brand;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (inStock) filters.inStock = inStock;
    if (sort) filters.sort = sort;
    
    // Only admins can see inactive products
    if (req.user?.role === 'admin' && showInactive === 'true') {
      filters.showInactive = 'true';
    }

    // Try to search with Elasticsearch
    const esResults = await elasticsearchService.searchProducts(
      query as string,
      filters,
      pageNum,
      limitNum
    );

    // If Elasticsearch is not available or returns no results, fall back to MongoDB
    if (!elasticsearchService.getConnectionStatus() || (esResults.total === 0 && query)) {
      logger.info('Falling back to MongoDB search');
      
      // Build MongoDB query
      const mongoQuery: any = {};
      
      if (query) {
        mongoQuery.$text = { $search: query as string };
      }
      
      if (categories) {
        mongoQuery.categories = { $in: Array.isArray(categories) ? categories : [categories] };
      }
      
      if (tags) {
        mongoQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      }
      
      if (brand) {
        mongoQuery.brand = brand;
      }
      
      if (minPrice || maxPrice) {
        mongoQuery.price = {};
        if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice as string);
      }
      
      if (inStock === 'true') {
        mongoQuery.inventory = { $gt: 0 };
      }
      
      // Only admins can see inactive products
      if (req.user?.role !== 'admin' || showInactive !== 'true') {
        mongoQuery.isActive = true;
      }
      
      // Execute MongoDB query
      const sortOptions = getSortOptions(sort as string);
      
      const products = await Product.find(mongoQuery)
        .sort(sortOptions)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
      
      const total = await Product.countDocuments(mongoQuery);
      
      // Get facets for filtering
      const [
        categoryFacets,
        brandFacets,
        priceRanges
      ] = await Promise.all([
        Product.aggregate([
          { $match: mongoQuery },
          { $unwind: '$categories' },
          { $group: { _id: '$categories', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]),
        Product.aggregate([
          { $match: mongoQuery },
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 }
        ]),
        Product.aggregate([
          { $match: mongoQuery },
          {
            $bucket: {
              groupBy: '$price',
              boundaries: [0, 50, 100, 200, 500, 1000],
              default: 'Other',
              output: { count: { $sum: 1 } }
            }
          }
        ])
      ]);
      
      return res.status(StatusCodes.OK).json({
        success: true,
        count: products.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        products,
        facets: {
          categories: categoryFacets,
          brands: brandFacets,
          priceRanges
        },
        searchMode: 'mongodb'
      });
    }
    
    // Return Elasticsearch results
    return res.status(StatusCodes.OK).json({
      success: true,
      count: esResults.products.length,
      total: esResults.total,
      totalPages: Math.ceil(esResults.total / limitNum),
      currentPage: pageNum,
      products: esResults.products,
      facets: esResults.aggregations,
      searchMode: 'elasticsearch'
    });
  } catch (error) {
    logger.error('Error in searchProducts:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error searching products',
      error: (error as Error).message
    });
  }
};

/**
 * Get product recommendations
 * @route GET /api/v1/search/recommendations/:productId
 */
export const getProductRecommendations = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { limit = '5' } = req.query;
    const limitNum = parseInt(limit as string, 10) || 5;
    
    // Try to get recommendations from Elasticsearch
    if (elasticsearchService.getConnectionStatus()) {
      const recommendations = await elasticsearchService.getProductRecommendations(productId, limitNum);
      
      if (recommendations.length > 0) {
        return res.status(StatusCodes.OK).json({
          success: true,
          count: recommendations.length,
          recommendations,
          source: 'elasticsearch'
        });
      }
    }
    
    // Fall back to MongoDB for recommendations
    logger.info('Falling back to MongoDB for recommendations');
    
    // Get the product to base recommendations on
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No product found with id ${productId}`
      });
    }
    
    // Find similar products based on categories and tags
    const recommendations = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      inventory: { $gt: 0 },
      $or: [
        { categories: { $in: product.categories } },
        { tags: { $in: product.tags } },
        { brand: product.brand }
      ]
    })
    .sort({ 'rating.average': -1 })
    .limit(limitNum);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      count: recommendations.length,
      recommendations,
      source: 'mongodb'
    });
  } catch (error) {
    logger.error('Error in getProductRecommendations:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error getting product recommendations',
      error: (error as Error).message
    });
  }
};

/**
 * Reindex all products to Elasticsearch
 * @route POST /api/v1/search/reindex
 * @access Admin only
 */
export const reindexProducts = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only admins can reindex products'
      });
    }
    
    // Get all products from MongoDB
    const products = await Product.find({});
    
    // Reindex to Elasticsearch
    await elasticsearchService.reindexAllProducts(products);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully reindexed ${products.length} products`
    });
  } catch (error) {
    logger.error('Error in reindexProducts:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error reindexing products',
      error: (error as Error).message
    });
  }
};

/**
 * Get sort options for MongoDB query
 * @param sort Sort parameter
 */
const getSortOptions = (sort: string): Record<string, 1 | -1> => {
  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'rating':
      return { 'rating.average': -1 };
    case 'popularity':
      return { 'rating.count': -1 };
    default:
      return { featured: -1, createdAt: -1 };
  }
};


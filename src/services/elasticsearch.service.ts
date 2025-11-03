import { Client } from '@elastic/elasticsearch';
import config from '../config';
import { logger } from '../utils/logger';
import { IProduct } from '../interfaces/Product';

/**
 * Elasticsearch Service
 * Provides methods for interacting with Elasticsearch
 */
class ElasticsearchService {
  private client: Client;
  private isConnected: boolean = false;
  private readonly productIndex = 'products';

  constructor() {
    this.client = new Client({
      node: config.elasticsearch.node,
      auth: {
        username: config.elasticsearch.username,
        password: config.elasticsearch.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.init();
  }

  /**
   * Initialize Elasticsearch connection and indices
   */
  private async init(): Promise<void> {
    try {
      const pingResult = await this.client.ping();
      if (pingResult) {
        this.isConnected = true;
        logger.info('Connected to Elasticsearch');
        await this.createIndices();
      }
    } catch (error: any) {
      this.isConnected = false;
      logger.error('Failed to connect to Elasticsearch:', error);
    }
  }

  /**
   * Create necessary indices if they don't exist
   */
  private async createIndices(): Promise<void> {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.productIndex,
      });

      if (!indexExists) {
        await this.client.indices.create({
          index: this.productIndex,
          mappings: {
            properties: {
              name: { type: 'text' },
              slug: { type: 'keyword' },
              description: { type: 'text' },
              shortDescription: { type: 'text' },
              price: { type: 'float' },
              compareAtPrice: { type: 'float' },
              sku: { type: 'keyword' },
              barcode: { type: 'keyword' },
              inventory: { type: 'integer' },
              isActive: { type: 'boolean' },
              featured: { type: 'boolean' },
              categories: { type: 'keyword' },
              tags: { type: 'keyword' },
              brand: { type: 'keyword' },
              manufacturer: { type: 'keyword' },
              attributes: { type: 'object' },
              variants: {
                type: 'nested',
                properties: {
                  name: { type: 'text' },
                  sku: { type: 'keyword' },
                  price: { type: 'float' },
                  inventory: { type: 'integer' },
                  attributes: { type: 'object' },
                }
              },
              rating: {
                properties: {
                  average: { type: 'float' },
                  count: { type: 'integer' },
                }
              },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            }
          },
          settings: {
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding', 'edge_ngram_filter']
                },
                search_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding']
                }
              },
              filter: {
                edge_ngram_filter: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 20
                }
              }
            }
          }
        });
        logger.info(`Created index: ${this.productIndex}`);
      }
    } catch (error: any) {
      logger.error('Error creating Elasticsearch indices:', error);
    }
  }

  /**
   * Index a product in Elasticsearch
   * @param product Product to index
   */
  public async indexProduct(product: IProduct): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.index({
        index: this.productIndex,
        id: product._id.toString(),
        document: {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku,
          barcode: product.barcode,
          inventory: product.inventory,
          isActive: product.isActive,
          featured: product.featured,
          categories: product.categories,
          tags: product.tags,
          brand: product.brand,
          manufacturer: product.manufacturer,
          attributes: product.attributes,
          variants: product.variants,
          rating: product.rating,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      });
      logger.info(`Indexed product: ${product._id}`);
    } catch (error: any) {
      logger.error(`Error indexing product ${product._id}:`, error);
    }
  }

  /**
   * Update a product in Elasticsearch
   * @param productId Product ID
   * @param updates Updates to apply
   */
  public async updateProduct(productId: string, updates: Partial<IProduct>): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.update({
        index: this.productIndex,
        id: productId,
        doc: updates
      });
      logger.info(`Updated product in Elasticsearch: ${productId}`);
    } catch (error: any) {
      logger.error(`Error updating product ${productId} in Elasticsearch:`, error);
    }
  }

  /**
   * Delete a product from Elasticsearch
   * @param productId Product ID
   */
  public async deleteProduct(productId: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.delete({
        index: this.productIndex,
        id: productId
      });
      logger.info(`Deleted product from Elasticsearch: ${productId}`);
    } catch (error: any) {
      logger.error(`Error deleting product ${productId} from Elasticsearch:`, error);
    }
  }

  /**
   * Search products in Elasticsearch
   * @param query Search query
   * @param filters Filters to apply
   * @param page Page number
   * @param limit Items per page
   */
  public async searchProducts(
    query?: string,
    filters: Record<string, any> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: any[]; total: number; aggregations?: any }> {
    if (!this.isConnected) {
      return { products: [], total: 0 };
    }

    try {
      const from = (page - 1) * limit;

      // Build query
      const must: any[] = [];
      const filter: any[] = [];

      // Add text search if query is provided
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['name^3', 'description^2', 'shortDescription^2', 'tags', 'brand', 'manufacturer'],
            fuzziness: 'AUTO',
          },
        });
      }

      // Add filters
      if (filters.minPrice || filters.maxPrice) {
        const range: any = {};
        if (filters.minPrice) range.gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) range.lte = parseFloat(filters.maxPrice);
        filter.push({ range: { price: range } });
      }

      if (filters.categories && filters.categories.length) {
        filter.push({ terms: { categories: filters.categories } });
      }

      if (filters.tags && filters.tags.length) {
        filter.push({ terms: { tags: filters.tags } });
      }

      if (filters.brand) {
        filter.push({ term: { brand: filters.brand } });
      }

      if (filters.inStock === 'true') {
        filter.push({ range: { inventory: { gt: 0 } } });
      }

      // Only show active products by default
      if (filters.showInactive !== 'true') {
        filter.push({ term: { isActive: true } });
      }

      // Execute search
      const searchParams: any = {
        index: this.productIndex,
        from,
        size: limit,
        query: {
          bool: {
            must,
            filter,
          }
        },
        sort: this.buildSortCriteria(filters.sort),
        aggs: {
          categories: {
            terms: { field: 'categories', size: 20 }
          },
          brands: {
            terms: { field: 'brand', size: 20 }
          },
          price_ranges: {
            range: {
              field: 'price',
              ranges: [
                { to: 50 },
                { from: 50, to: 100 },
                { from: 100, to: 200 },
                { from: 200, to: 500 },
                { from: 500 }
              ]
            }
          },
          avg_rating: {
            avg: { field: 'rating.average' }
          }
        }
      };

      const result = await this.client.search(searchParams);

      const hits = result.hits.hits;
      const total = result.hits.total as { value: number };
      const aggregations = result.aggregations;

      const products = hits.map((hit) => hit._source);

      return {
        products,
        total: total.value,
        aggregations,
      };
    } catch (error: any) {
      logger.error('Error searching products in Elasticsearch:', error);
      return { products: [], total: 0 };
    }
  }

  /**
   * Build sort criteria based on sort parameter
   * @param sort Sort parameter
   */
  private buildSortCriteria(sort?: string): any[] {
    switch (sort) {
      case 'price_asc':
        return [{ price: 'asc' }];
      case 'price_desc':
        return [{ price: 'desc' }];
      case 'newest':
        return [{ createdAt: 'desc' }];
      case 'rating':
        return [{ 'rating.average': 'desc' }];
      case 'popularity':
        return [{ 'rating.count': 'desc' }];
      default:
        return [{ _score: 'desc' }, { featured: 'desc' }];
    }
  }

  /**
   * Get product recommendations based on a product
   * @param productId Product ID
   * @param limit Number of recommendations to return
   */
  public async getProductRecommendations(productId: string, limit: number = 5): Promise<any[]> {
    if (!this.isConnected) {
      return [];
    }

    try {
      // First get the product to base recommendations on
      const productResult = await this.client.get({
        index: this.productIndex,
        id: productId,
      });

      const product = productResult._source as any;

      // Get similar products based on categories and tags
      const searchParams: any = {
        index: this.productIndex,
        size: limit,
        query: {
          bool: {
            must_not: {
              term: { _id: productId }
            },
            should: [
              {
                terms: {
                  categories: product.categories || [],
                  boost: 2.0
                }
              },
              {
                terms: {
                  tags: product.tags || [],
                  boost: 1.5
                }
              },
              {
                term: {
                  brand: {
                    value: product.brand,
                    boost: 1.0
                  }
                }
              }
            ],
            filter: [
              { term: { isActive: true } },
              { range: { inventory: { gt: 0 } } }
            ],
            minimum_should_match: 1
          }
        }
      };

      const result = await this.client.search(searchParams);

      return result.hits.hits.map((hit) => hit._source);
    } catch (error: any) {
      logger.error(`Error getting product recommendations for ${productId}:`, error);
      return [];
    }
  }

  /**
   * Reindex all products from MongoDB to Elasticsearch
   * @param products Products to reindex
   */
  public async reindexAllProducts(products: IProduct[]): Promise<void> {
    if (!this.isConnected) return;

    try {
      // Delete the index if it exists
      const indexExists = await this.client.indices.exists({
        index: this.productIndex,
      });

      if (indexExists) {
        await this.client.indices.delete({
          index: this.productIndex,
        });
      }

      // Recreate the index
      await this.createIndices();

      // Bulk index all products
      const operations = products.flatMap((product) => [
        { index: { _index: this.productIndex, _id: product._id.toString() } },
        {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku,
          barcode: product.barcode,
          inventory: product.inventory,
          isActive: product.isActive,
          featured: product.featured,
          categories: product.categories,
          tags: product.tags,
          brand: product.brand,
          manufacturer: product.manufacturer,
          attributes: product.attributes,
          variants: product.variants,
          rating: product.rating,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      ]);

      if (operations.length > 0) {
        const result = await this.client.bulk({ operations, refresh: true });
        if (result.errors) {
          logger.error('Errors during bulk indexing:', result.items);
        } else {
          logger.info(`Successfully reindexed ${products.length} products`);
        }
      }
    } catch (error: any) {
      logger.error('Error reindexing products:', error);
    }
  }

  /**
   * Check if Elasticsearch is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default new ElasticsearchService();


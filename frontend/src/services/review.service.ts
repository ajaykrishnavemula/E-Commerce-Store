import apiService from './api';
import type { Review, ReviewsResponse, ReviewFormData } from '../types';

class ReviewService {
  async getProductReviews(productId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    return await apiService.get<ReviewsResponse>(`/products/${productId}/reviews`, { page, limit });
  }

  async createReview(productId: string, reviewData: ReviewFormData): Promise<Review> {
    return await apiService.post<Review>(`/products/${productId}/reviews`, reviewData);
  }

  async updateReview(productId: string, reviewId: string, reviewData: ReviewFormData): Promise<Review> {
    return await apiService.put<Review>(`/products/${productId}/reviews/${reviewId}`, reviewData);
  }

  async deleteReview(productId: string, reviewId: string): Promise<void> {
    await apiService.delete(`/products/${productId}/reviews/${reviewId}`);
  }

  async getUserReviews(): Promise<Review[]> {
    return await apiService.get<Review[]>('/reviews/my-reviews');
  }
}

export const reviewService = new ReviewService();
export default reviewService;



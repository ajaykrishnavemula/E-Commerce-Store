import mongoose, { Document, Types } from 'mongoose';

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewMethods {
  isEditable(): boolean;
}

export interface ReviewModel extends mongoose.Model<IReview, {}, IReviewMethods> {
  calculateAverageRating(productId: mongoose.Types.ObjectId): Promise<void>;
}

export interface IReviewDocument extends mongoose.Document, IReviewMethods {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}


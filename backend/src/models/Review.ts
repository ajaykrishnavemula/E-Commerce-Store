import mongoose, { Schema } from 'mongoose';
import { IReview, IReviewMethods, ReviewModel, IReviewDocument } from '../interfaces/Review';

const ReviewSchema = new Schema<IReviewDocument, ReviewModel, IReviewMethods>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    notHelpfulVotes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot be more than 500 characters'],
    },
    images: {
      type: [String],
      validate: [
        {
          validator: function (v: string[]) {
            return v.length <= 5;
          },
          message: 'Cannot upload more than 5 images',
        },
      ],
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ product: 1, rating: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ createdAt: -1 });

// Methods
ReviewSchema.method('isEditable', function (this: IReviewDocument): boolean {
  // Reviews can be edited within 30 days of creation
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const creationDate = this.createdAt.getTime();
  const currentDate = new Date().getTime();
  
  return currentDate - creationDate <= thirtyDaysInMs;
});

// Static methods
ReviewSchema.statics.calculateAverageRating = async function (productId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
      'rating.count': stats[0].numReviews,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0,
    });
  }
};

// Middleware
ReviewSchema.post('save', async function () {
  // @ts-ignore
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post('remove', async function () {
  // @ts-ignore
  await this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model<IReviewDocument, ReviewModel>('Review', ReviewSchema);

export default Review;


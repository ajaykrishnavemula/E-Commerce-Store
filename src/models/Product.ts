import mongoose from 'mongoose';
import { IProduct } from '../interfaces/Product';

// Product variant schema
const ProductVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide variant name'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please provide SKU'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative'],
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative'],
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
  },
  inventory: {
    type: Number,
    required: [true, 'Please provide inventory count'],
    default: 0,
    min: [0, 'Inventory cannot be negative'],
  },
  attributes: {
    type: Map,
    of: String,
    required: [true, 'Please provide variant attributes'],
  },
  images: {
    type: [String],
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative'],
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative'],
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm',
    },
  },
});

// Product schema
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true,
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot be more than 200 characters'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
    },
    sku: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    inventory: {
      type: Number,
      required: [true, 'Please provide inventory count'],
      default: 0,
      min: [0, 'Inventory cannot be negative'],
    },
    lowInventoryThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low inventory threshold cannot be negative'],
    },
    isTrackingInventory: {
      type: Boolean,
      default: true,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg',
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, 'Length cannot be negative'],
      },
      width: {
        type: Number,
        min: [0, 'Width cannot be negative'],
      },
      height: {
        type: Number,
        min: [0, 'Height cannot be negative'],
      },
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnailImage: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    tax: {
      taxable: {
        type: Boolean,
        default: true,
      },
      taxClass: {
        type: String,
        trim: true,
      },
      taxRate: {
        type: Number,
        min: [0, 'Tax rate cannot be negative'],
        max: [1, 'Tax rate cannot be more than 100%'],
      },
    },
    shipping: {
      requiresShipping: {
        type: Boolean,
        default: true,
      },
      shippingClass: {
        type: String,
        trim: true,
      },
      shippingWeight: {
        type: Number,
        min: [0, 'Shipping weight cannot be negative'],
      },
    },
    seo: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      keywords: {
        type: [String],
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot be more than 5'],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative'],
      },
    },
    reviews: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          title: {
            type: String,
            trim: true,
          },
          comment: {
            type: String,
            required: true,
            trim: true,
          },
          isVerifiedPurchase: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    relatedProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    company: {
      type: String,
      enum: {
        values: ['ikea', 'liddy', 'caressa', 'marcos'],
        message: '{VALUE} is not supported',
      },
      required: [true, 'Please provide company'],
    },
  },
  { timestamps: true }
);

// Create text indexes for search
ProductSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
  brand: 'text',
  'attributes.$*': 'text',
});

// Pre-save hook to generate slug from product name
ProductSchema.pre('save', function (this: IProduct, next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Method to calculate average rating
ProductSchema.methods.calculateAverageRating = async function (this: IProduct) {
  const reviews = this.reviews || [];
  
  if (reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  this.rating.average = Math.round((sum / reviews.length) * 10) / 10;
  this.rating.count = reviews.length;
  
  await this.save();
};

export default mongoose.model<IProduct>('Product', ProductSchema);


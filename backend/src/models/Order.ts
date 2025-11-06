import mongoose from 'mongoose';
import { IOrder, IOrderModel } from '../interfaces/Order';

// Order item schema
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide product ID'],
  },
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1'],
  },
  variant: {
    id: {
      type: String,
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
    },
  },
  image: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    trim: true,
  },
  subtotal: {
    type: Number,
    required: [true, 'Please provide subtotal'],
    min: [0, 'Subtotal cannot be negative'],
  },
});

// Shipping method schema
const ShippingMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide shipping method name'],
    trim: true,
  },
  carrier: {
    type: String,
    required: [true, 'Please provide carrier'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide shipping price'],
    min: [0, 'Shipping price cannot be negative'],
  },
  estimatedDelivery: {
    min: {
      type: Number,
      min: [0, 'Minimum delivery days cannot be negative'],
    },
    max: {
      type: Number,
      min: [0, 'Maximum delivery days cannot be negative'],
    },
  },
});

// Payment schema
const PaymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['credit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
    required: [true, 'Please provide payment method'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'refunded', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0, 'Payment amount cannot be negative'],
  },
  currency: {
    type: String,
    required: [true, 'Please provide currency'],
    trim: true,
    default: 'USD',
  },
  paidAt: {
    type: Date,
  },
});

// Discount schema
const DiscountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide discount code'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please provide discount type'],
  },
  value: {
    type: Number,
    required: [true, 'Please provide discount value'],
    min: [0, 'Discount value cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
  },
});

// Tax schema
const TaxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide tax name'],
    trim: true,
  },
  rate: {
    type: Number,
    required: [true, 'Please provide tax rate'],
    min: [0, 'Tax rate cannot be negative'],
    max: [1, 'Tax rate cannot be more than 100%'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide tax amount'],
    min: [0, 'Tax amount cannot be negative'],
  },
});

// Order status history schema
const OrderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: [true, 'Please provide status'],
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Order schema
const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Please provide order number'],
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide customer ID'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      trim: true,
      lowercase: true,
    },
    items: {
      type: [OrderItemSchema],
      required: [true, 'Please provide order items'],
      validate: {
        validator: function(items: any[]) {
          return items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    billingAddress: {
      fullName: {
        type: String,
        required: [true, 'Please provide full name'],
        trim: true,
      },
      addressLine1: {
        type: String,
        required: [true, 'Please provide address line 1'],
        trim: true,
      },
      addressLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Please provide city'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Please provide state/province'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Please provide postal code'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Please provide country'],
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, 'Please provide full name'],
        trim: true,
      },
      addressLine1: {
        type: String,
        required: [true, 'Please provide address line 1'],
        trim: true,
      },
      addressLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Please provide city'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Please provide state/province'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Please provide postal code'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Please provide country'],
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    shippingMethod: {
      type: ShippingMethodSchema,
      required: [true, 'Please provide shipping method'],
    },
    payment: {
      type: PaymentSchema,
      required: [true, 'Please provide payment information'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Please provide subtotal'],
      min: [0, 'Subtotal cannot be negative'],
    },
    shippingCost: {
      type: Number,
      required: [true, 'Please provide shipping cost'],
      min: [0, 'Shipping cost cannot be negative'],
    },
    discount: {
      type: DiscountSchema,
    },
    tax: {
      type: [TaxSchema],
      default: [],
    },
    total: {
      type: Number,
      required: [true, 'Please provide total'],
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Please provide currency'],
      trim: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: {
      type: [OrderStatusHistorySchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    invoiceUrl: {
      type: String,
      trim: true,
    },
    refunds: {
      type: [
        {
          amount: {
            type: Number,
            required: true,
            min: [0, 'Refund amount cannot be negative'],
          },
          reason: {
            type: String,
            required: true,
            trim: true,
          },
          date: {
            type: Date,
            default: Date.now,
          },
          transactionId: {
            type: String,
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Pre-save hook to add initial status history
OrderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order created',
    });
  } else if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// Generate order number
OrderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  // Find the highest order number with this prefix
  const lastOrder = await this.findOne(
    { orderNumber: new RegExp(`^${prefix}`) },
    { orderNumber: 1 },
    { sort: { orderNumber: -1 } }
  );
  
  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}-${String(nextNumber).padStart(5, '0')}`;
};

export default mongoose.model<IOrder, IOrderModel>('Order', OrderSchema);


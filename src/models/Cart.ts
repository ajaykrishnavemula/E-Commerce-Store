import mongoose from 'mongoose';
import { ICart, CartModel, ICartItem } from '../interfaces/Cart';

// Cart item schema
const CartItemSchema = new mongoose.Schema({
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
  maxQuantity: {
    type: Number,
    min: [0, 'Max quantity cannot be negative'],
  },
});

// Cart schema
const CartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
      trim: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },
    discountCode: {
      type: String,
      trim: true,
    },
    discount: {
      code: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      value: {
        type: Number,
        min: [0, 'Discount value cannot be negative'],
      },
      description: {
        type: String,
        trim: true,
      },
    },
    tax: {
      rate: {
        type: Number,
        min: [0, 'Tax rate cannot be negative'],
        max: [1, 'Tax rate cannot be more than 100%'],
      },
      amount: {
        type: Number,
        min: [0, 'Tax amount cannot be negative'],
      },
    },
    shippingMethod: {
      id: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      price: {
        type: Number,
        min: [0, 'Shipping price cannot be negative'],
      },
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Validate that either customer or sessionId is provided
CartSchema.pre('validate', function(this: CartModel, next) {
  if (!this.customer && !this.sessionId) {
    next(new Error('Either customer or sessionId must be provided'));
  } else {
    next();
  }
});

// Set expiration for guest carts
CartSchema.pre('save', function(this: CartModel, next) {
  if (this.isNew && !this.customer) {
    // Set expiration to 30 days from now for guest carts
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Add item to cart
CartSchema.methods.addItem = async function(productId: string, quantity: number, variantId?: string) {
  // Find product in database
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check if product is active
  if (!product.isActive) {
    throw new Error('Product is not available');
  }
  
  // Find variant if provided
  let variant = null;
  if (variantId && product.hasVariants) {
    variant = product.variants.find((v: any) => v._id.toString() === variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }
  }
  
  // Check inventory
  const inventory = variant ? variant.inventory : product.inventory;
  if (inventory < quantity) {
    throw new Error('Not enough inventory');
  }
  
  // Check if item already exists in cart
  const existingItemIndex = this.items.findIndex((item: ICartItem) => {
    if (variantId) {
      return item.product.toString() === productId && item.variant?.id === variantId;
    }
    return item.product.toString() === productId && !item.variant;
  });
  
  if (existingItemIndex > -1) {
    // Update existing item
    const newQuantity = this.items[existingItemIndex].quantity + quantity;
    if (newQuantity > inventory) {
      throw new Error('Not enough inventory');
    }
    
    this.items[existingItemIndex].quantity = newQuantity;
    this.items[existingItemIndex].subtotal = this.items[existingItemIndex].price * newQuantity;
    this.items[existingItemIndex].maxQuantity = inventory;
  } else {
    // Add new item
    const price = variant ? variant.price : product.price;
    const sku = variant ? variant.sku : product.sku;
    const image = product.images.length > 0 ? product.images[0] : undefined;
    
    const newItem: ICartItem = {
      product: new mongoose.Types.ObjectId(productId),
      name: product.name,
      price,
      quantity,
      subtotal: price * quantity,
      maxQuantity: inventory,
      sku,
      image,
    };
    
    if (variant) {
      newItem.variant = {
        id: variantId as string,
        attributes: variant.attributes,
      };
    }
    
    this.items.push(newItem);
  }
  
  // Calculate totals
  await this.calculateTotals();
};

// Update item quantity
CartSchema.methods.updateItemQuantity = async function(itemId: string, quantity: number) {
  const itemIndex = this.items.findIndex((item: any) => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    return this.removeItem(itemId);
  }
  
  if (quantity > this.items[itemIndex].maxQuantity) {
    throw new Error('Not enough inventory');
  }
  
  this.items[itemIndex].quantity = quantity;
  this.items[itemIndex].subtotal = this.items[itemIndex].price * quantity;
  
  // Calculate totals
  await this.calculateTotals();
};

// Remove item from cart
CartSchema.methods.removeItem = async function(itemId: string) {
  this.items = this.items.filter((item: any) => item._id.toString() !== itemId);
  
  // Calculate totals
  await this.calculateTotals();
};

// Clear cart
CartSchema.methods.clearCart = async function() {
  this.items = [];
  this.subtotal = 0;
  this.discount = undefined;
  this.discountCode = undefined;
  this.tax = undefined;
  this.shippingMethod = undefined;
  this.total = 0;
  
  await this.save();
};

// Apply discount code
CartSchema.methods.applyDiscount = async function(code: string) {
  // In a real application, you would validate the discount code against a database
  // For this example, we'll just apply a simple discount
  
  // Check if code is valid (mock implementation)
  const validCodes: Record<string, { type: 'percentage' | 'fixed', value: number, description: string }> = {
    'WELCOME10': { type: 'percentage', value: 0.1, description: '10% off your order' },
    'SAVE20': { type: 'percentage', value: 0.2, description: '20% off your order' },
    'FLAT5': { type: 'fixed', value: 5, description: '$5 off your order' },
  };
  
  if (!validCodes[code]) {
    throw new Error('Invalid discount code');
  }
  
  this.discountCode = code;
  this.discount = {
    code,
    type: validCodes[code].type,
    value: validCodes[code].value,
    description: validCodes[code].description
  };
  
  // Calculate totals
  await this.calculateTotals();
  
  return true;
};

// Calculate totals
CartSchema.methods.calculateTotals = async function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total: number, item: ICartItem) => total + item.subtotal, 0);
  
  // Apply discount if any
  let discountAmount = 0;
  if (this.discount) {
    if (this.discount.type === 'percentage') {
      discountAmount = this.subtotal * this.discount.value;
    } else {
      discountAmount = Math.min(this.discount.value, this.subtotal); // Don't allow negative totals
    }
  }
  
  // Calculate tax
  let taxAmount = 0;
  if (this.tax) {
    taxAmount = (this.subtotal - discountAmount) * this.tax.rate;
    this.tax.amount = taxAmount;
  }
  
  // Calculate shipping
  let shippingCost = 0;
  if (this.shippingMethod) {
    shippingCost = this.shippingMethod.price;
  }
  
  // Calculate total
  this.total = this.subtotal - discountAmount + taxAmount + shippingCost;
  
  await this.save();
};

// Set shipping method
CartSchema.methods.setShippingMethod = async function(methodId: string) {
  // In a real application, you would fetch shipping methods from a database
  // For this example, we'll use a simple mock
  
  const shippingMethods: Record<string, { id: string, name: string, price: number }> = {
    'standard': { id: 'standard', name: 'Standard Shipping', price: 5.99 },
    'express': { id: 'express', name: 'Express Shipping', price: 14.99 },
    'free': { id: 'free', name: 'Free Shipping', price: 0 },
  };
  
  if (!shippingMethods[methodId]) {
    throw new Error('Invalid shipping method');
  }
  
  this.shippingMethod = shippingMethods[methodId];
  
  // Calculate totals
  await this.calculateTotals();
};

export default mongoose.model<CartModel>('Cart', CartSchema);


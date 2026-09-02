import mongoose, { Schema, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  selectedSize?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
}

export interface IShippingAddress {
  streetAddress: string;
  city: string;
  postalCode: string;
  country?: string;
}

export interface IOrder {
  orderId: string;
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true,
    },
    selectedSize: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price snapshot is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    streetAddress: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'Japan',
      trim: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      type: CustomerSchema,
      required: [true, 'Customer details are required'],
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    items: {
      type: [OrderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: (items: IOrderItem[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

// Prevent model recompilation during Next.js hot module replacement (HMR)
export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

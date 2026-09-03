import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  category?: string;
  imagePath?: string;
  japaneseTitle?: string;
  character: string;
  rank?: string;
  collection: string;
  price: number;
  currency: string;
  formattedPrice: string;
  description: string;
  details: string[];
  material?: string;
  gsm?: number;
  fit?: string;
  color?: string;
  sizes: string[];
  images: string[];
  lookbookImages: string[];
  stock: number;
  tags: string[];
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: [true, 'Product ID is required'],
      index: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    imagePath: {
      type: String,
      default: '',
      trim: true,
    },
    japaneseTitle: {
      type: String,
      default: '',
      trim: true,
    },
    character: {
      type: String,
      required: [true, 'Character is required'],
      trim: true,
    },
    rank: {
      type: String,
      default: '',
      trim: true,
    },
    collection: {
      type: String,
      required: [true, 'Collection is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
      trim: true,
    },
    formattedPrice: {
      type: String,
      required: [true, 'Formatted price is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    details: {
      type: [String],
      default: [],
    },
    material: {
      type: String,
      default: '',
      trim: true,
    },
    gsm: {
      type: Number,
      default: 0,
      min: [0, 'GSM cannot be negative'],
    },
    fit: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    sizes: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    lookbookImages: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'products',
    suppressReservedKeysWarning: true,
  }
);

// Helpful indexes for catalog filtering, sorting, and low-stock analytics
ProductSchema.index({ category: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });

// Prevent model recompilation during Next.js hot module replacement (HMR)
export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

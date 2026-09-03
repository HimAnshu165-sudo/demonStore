import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Order, IOrderItem } from '@/models/Order';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface OrderItemRequest {
  slug?: string;
  productId?: string;
  selectedSize?: string;
  quantity?: number;
}

interface OrderRequestBody {
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  shippingAddress?: {
    streetAddress?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items?: OrderItemRequest[];
}

const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${randomSuffix}`;
}

/**
 * GET /api/orders
 * Retrieves all orders with server-side pagination and newest-first sorting.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and sanitize pagination parameters safely
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '10', 10);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit) || 1;

    const orders = await Order.find({}, { _id: 0, __v: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        pagination: {
          page,
          limit,
          totalOrders,
          totalPages,
        },
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve orders',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Validates inventory and creates a new order in MongoDB.
 */
export async function POST(request: Request) {
  let body: OrderRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid JSON request payload',
      },
      { status: 400 }
    );
  }

  const { customer, shippingAddress, items } = body;

  // 1. Validate Customer Information
  if (
    !customer ||
    typeof customer.firstName !== 'string' ||
    !customer.firstName.trim() ||
    typeof customer.lastName !== 'string' ||
    !customer.lastName.trim() ||
    typeof customer.email !== 'string' ||
    !EMAIL_REGEX.test(customer.email.trim())
  ) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or incomplete customer information. Valid first name, last name, and email are required.',
      },
      { status: 400 }
    );
  }

  // 2. Validate Shipping Address
  if (
    !shippingAddress ||
    typeof shippingAddress.streetAddress !== 'string' ||
    !shippingAddress.streetAddress.trim() ||
    typeof shippingAddress.city !== 'string' ||
    !shippingAddress.city.trim() ||
    typeof shippingAddress.postalCode !== 'string' ||
    !shippingAddress.postalCode.trim()
  ) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or incomplete shipping address. Street address, city, and postal code are required.',
      },
      { status: 400 }
    );
  }

  // 3. Validate Items Array
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: 'Order must contain at least one item',
      },
      { status: 400 }
    );
  }

  // Validate item format
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const identifier = item.slug || item.productId;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: `Item at index ${i} is missing a valid product identifier (slug or productId)`,
        },
        { status: 400 }
      );
    }

    if (
      typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid quantity for item "${identifier}". Quantity must be a positive integer.`,
        },
        { status: 400 }
      );
    }

    if (item.selectedSize && typeof item.selectedSize !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid size format for item "${identifier}".`,
        },
        { status: 400 }
      );
    }
  }

  try {
    await connectToDatabase();

    // 4. Fetch Products from MongoDB & Validate Inventory / Price Snapshot
    const orderItems: IOrderItem[] = [];
    let calculatedSubtotal = 0;

    const preparedItems: {
      dbProduct: InstanceType<typeof Product>;
      requestedQty: number;
      selectedSize?: string;
    }[] = [];

    for (const item of items) {
      const identifier = (item.slug || item.productId)!.trim();
      const product = await Product.findOne({
        $or: [{ slug: identifier.toLowerCase() }, { id: identifier }],
      });

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product "${identifier}" not found in catalog`,
          },
          { status: 404 }
        );
      }

      // Validate size against product configuration if size provided
      if (item.selectedSize && product.sizes && product.sizes.length > 0) {
        if (!product.sizes.includes(item.selectedSize)) {
          return NextResponse.json(
            {
              success: false,
              message: `Size "${item.selectedSize}" is not available for product "${product.name}". Available sizes: ${product.sizes.join(', ')}`,
            },
            { status: 400 }
          );
        }
      }

      // Check stock
      if (product.stock < item.quantity!) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      // Server-side price calculation snapshot (IGNORES any client-provided price)
      const itemPrice = product.price;
      const itemSubtotal = itemPrice * item.quantity!;
      calculatedSubtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        selectedSize: item.selectedSize,
        quantity: item.quantity!,
        price: itemPrice,
        image: product.images?.[0] || product.imagePath || '/assets/products/hoodie_01.png',
      });

      preparedItems.push({
        dbProduct: product,
        requestedQty: item.quantity!,
        selectedSize: item.selectedSize,
      });
    }

    const shippingCost = 0; // Complimentary Global Courier
    const calculatedTotal = calculatedSubtotal + shippingCost;
    const orderId = generateOrderId();

    // 5. Atomic Stock Reservation with Safe Rollback
    const successfullyReserved: { productId: unknown; qty: number }[] = [];

    for (const { dbProduct, requestedQty } of preparedItems) {
      const updateResult = await Product.updateOne(
        {
          _id: dbProduct._id,
          stock: { $gte: requestedQty },
        },
        {
          $inc: { stock: -requestedQty },
        }
      );

      if (updateResult.modifiedCount === 0) {
        // Roll back any items reserved so far
        for (const reserved of successfullyReserved) {
          await Product.updateOne(
            { _id: reserved.productId },
            { $inc: { stock: reserved.qty } }
          );
        }

        return NextResponse.json(
          {
            success: false,
            message: `Stock conflict: Unable to reserve requested quantity for "${dbProduct.name}". Please retry.`,
          },
          { status: 400 }
        );
      }

      successfullyReserved.push({
        productId: dbProduct._id,
        qty: requestedQty,
      });
    }

    // 6. Create and Save the Order (associating with authenticated user if session exists)
    try {
      const session = await getAuthenticatedUser(request);
      const userId = session?.userId || null;

      const newOrder = new Order({
        orderId,
        userId,
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: customer.email.trim().toLowerCase(),
        },
        shippingAddress: {
          streetAddress: shippingAddress.streetAddress.trim(),
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country?.trim() || 'Japan',
        },
        items: orderItems,
        subtotal: calculatedSubtotal,
        shippingCost,
        total: calculatedTotal,
        currency: 'INR',
        status: 'pending',
      });

      await newOrder.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Order created successfully',
          order: {
            orderId: newOrder.orderId,
            status: newOrder.status,
            subtotal: newOrder.subtotal,
            shippingCost: newOrder.shippingCost,
            total: newOrder.total,
            currency: newOrder.currency,
            itemCount: newOrder.items.length,
            createdAt: newOrder.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (saveError) {
      // Roll back all reserved stock if saving order document failed
      for (const reserved of successfullyReserved) {
        await Product.updateOne(
          { _id: reserved.productId },
          { $inc: { stock: reserved.qty } }
        );
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process order. An unexpected server error occurred.',
      },
      { status: 500 }
    );
  }
}

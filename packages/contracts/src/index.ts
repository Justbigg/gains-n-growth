import { z } from 'zod';

export const currencySchema = z.enum(['USD', 'EUR', 'GBP']);
export type Currency = z.infer<typeof currencySchema>;

export const productCategorySchema = z.enum([
  'winter-fashion',
  'jewelry',
  'electronics',
  'creator-merchandise',
]);
export type ProductCategory = z.infer<typeof productCategorySchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: productCategorySchema,
  priceMinor: z.number().int().nonnegative(),
  currency: currencySchema,
  imageUrl: z.string().regex(/^(\/[A-Za-z0-9._/-]+|https:\/\/[a-z0-9.-]+\/)/),
  inventory: z.number().int().nonnegative(),
  featured: z.boolean(),
});
export type Product = z.infer<typeof productSchema>;

export const productListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: productCategorySchema.optional(),
  currency: currencySchema.default('USD'),
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'newest']).default('featured'),
});

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

export const checkoutRequestSchema = z.object({
  currency: currencySchema,
  paymentMethod: z.literal('mock'),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const checkoutResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1),
  status: z.enum(['review_required', 'paid']),
  currency: currencySchema,
  subtotalMinor: z.number().int().nonnegative(),
  shippingMinor: z.number().int().nonnegative(),
  totalMinor: z.number().int().nonnegative(),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

export const orderStatusSchema = z.enum([
  'pending',
  'review_required',
  'paid',
  'fulfilling',
  'shipped',
  'delivered',
  'cancelled',
]);

export const paginationSchema = z.object({
  nextCursor: z.string().max(512).nullable(),
  hasMore: z.boolean(),
});

export const accountSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1),
  role: z.enum(['shopper', 'operator']),
  locale: z.enum(['en-US', 'fr-FR', 'ja-JP']),
  timezone: z.string().min(1),
  currency: currencySchema,
  recommendationsConsent: z.boolean(),
  analyticsConsent: z.boolean(),
});
export type Account = z.infer<typeof accountSchema>;

export const cartResponseSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      slug: z.string().min(1),
      name: z.string().min(1),
      imageUrl: productSchema.shape.imageUrl,
      unitPriceMinor: z.number().int().nonnegative(),
      quantity: z.number().int().min(1).max(10),
      available: z.number().int().nonnegative(),
    }),
  ),
  currency: currencySchema,
  subtotalMinor: z.number().int().nonnegative(),
  shippingMinor: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});
export type CartResponse = z.infer<typeof cartResponseSchema>;

export const accountOrdersResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      orderNumber: z.string().min(1),
      status: orderStatusSchema,
      currency: currencySchema,
      totalMinor: z.number().int().nonnegative(),
      createdAt: z.string().datetime(),
      items: z.array(
        z.object({
          productName: z.string().min(1),
          quantity: z.number().int().min(1),
        }),
      ),
    }),
  ),
  pagination: paginationSchema,
});
export type AccountOrdersResponse = z.infer<typeof accountOrdersResponseSchema>;

export const recommendationResponseSchema = z.object({
  items: z.array(
    productSchema.extend({
      reason: z.enum(['popular_in_store', 'same_category', 'recent_category']),
    }),
  ),
  personalization: z.enum([
    'consented_category_context',
    'consented_cold_start',
    'non_personalized',
  ]),
});
export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const consentUpdateSchema = z.object({
  recommendations: z.boolean(),
  analytics: z.boolean(),
});

export const accountPreferencesSchema = z.object({
  locale: z.enum(['en-US', 'fr-FR', 'ja-JP']),
  timezone: z.string().trim().min(1).max(64),
  currency: currencySchema,
});

export const commerceEventSchema = z.object({
  name: z.enum(['product_viewed', 'recommendation_clicked', 'search_submitted']),
  productId: z.string().uuid().optional(),
  source: z.enum(['storefront', 'pwa', 'pos', 'marketplace']),
});

export const adminProductUpdateSchema = z
  .object({
    priceMinor: z.number().int().min(0).max(10_000_000).optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
    inventoryOnHand: z.number().int().min(0).max(1_000_000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

export const reviewDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
});

export const fulfillmentStatusSchema = z.enum(['fulfilling', 'shipped', 'delivered']);
export const fulfillmentStatusUpdateSchema = z.object({
  status: fulfillmentStatusSchema,
});

export const demoSessionRequestSchema = z.object({
  role: z.enum(['shopper', 'operator']),
});

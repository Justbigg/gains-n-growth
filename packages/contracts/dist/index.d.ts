import { z } from 'zod';
export declare const currencySchema: z.ZodEnum<{
    USD: "USD";
    EUR: "EUR";
    GBP: "GBP";
}>;
export type Currency = z.infer<typeof currencySchema>;
export declare const productCategorySchema: z.ZodEnum<{
    "winter-fashion": "winter-fashion";
    jewelry: "jewelry";
    electronics: "electronics";
    "creator-merchandise": "creator-merchandise";
}>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export declare const productSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<{
        "winter-fashion": "winter-fashion";
        jewelry: "jewelry";
        electronics: "electronics";
        "creator-merchandise": "creator-merchandise";
    }>;
    priceMinor: z.ZodNumber;
    currency: z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>;
    imageUrl: z.ZodString;
    inventory: z.ZodNumber;
    featured: z.ZodBoolean;
}, z.core.$strip>;
export type Product = z.infer<typeof productSchema>;
export declare const productListQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        "winter-fashion": "winter-fashion";
        jewelry: "jewelry";
        electronics: "electronics";
        "creator-merchandise": "creator-merchandise";
    }>>;
    currency: z.ZodDefault<z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodDefault<z.ZodEnum<{
        featured: "featured";
        "price-asc": "price-asc";
        "price-desc": "price-desc";
        newest: "newest";
    }>>;
}, z.core.$strip>;
export declare const addCartItemSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const updateCartItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const checkoutRequestSchema: z.ZodObject<{
    currency: z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>;
    paymentMethod: z.ZodLiteral<"mock">;
}, z.core.$strip>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export declare const checkoutResponseSchema: z.ZodObject<{
    id: z.ZodString;
    orderNumber: z.ZodString;
    status: z.ZodEnum<{
        review_required: "review_required";
        paid: "paid";
    }>;
    currency: z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>;
    subtotalMinor: z.ZodNumber;
    shippingMinor: z.ZodNumber;
    totalMinor: z.ZodNumber;
}, z.core.$strip>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
export declare const orderStatusSchema: z.ZodEnum<{
    review_required: "review_required";
    paid: "paid";
    pending: "pending";
    fulfilling: "fulfilling";
    shipped: "shipped";
    delivered: "delivered";
    cancelled: "cancelled";
}>;
export declare const paginationSchema: z.ZodObject<{
    nextCursor: z.ZodNullable<z.ZodString>;
    hasMore: z.ZodBoolean;
}, z.core.$strip>;
export declare const accountSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    role: z.ZodEnum<{
        shopper: "shopper";
        operator: "operator";
    }>;
    locale: z.ZodEnum<{
        "en-US": "en-US";
        "fr-FR": "fr-FR";
        "ja-JP": "ja-JP";
    }>;
    timezone: z.ZodString;
    currency: z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>;
    recommendationsConsent: z.ZodBoolean;
    analyticsConsent: z.ZodBoolean;
}, z.core.$strip>;
export type Account = z.infer<typeof accountSchema>;
export declare const cartResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        slug: z.ZodString;
        name: z.ZodString;
        imageUrl: z.ZodString;
        unitPriceMinor: z.ZodNumber;
        quantity: z.ZodNumber;
        available: z.ZodNumber;
    }, z.core.$strip>>;
    currency: z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>;
    subtotalMinor: z.ZodNumber;
    shippingMinor: z.ZodNumber;
    itemCount: z.ZodNumber;
}, z.core.$strip>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
export declare const accountOrdersResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            review_required: "review_required";
            paid: "paid";
            pending: "pending";
            fulfilling: "fulfilling";
            shipped: "shipped";
            delivered: "delivered";
            cancelled: "cancelled";
        }>;
        currency: z.ZodEnum<{
            USD: "USD";
            EUR: "EUR";
            GBP: "GBP";
        }>;
        totalMinor: z.ZodNumber;
        createdAt: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            productName: z.ZodString;
            quantity: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        nextCursor: z.ZodNullable<z.ZodString>;
        hasMore: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AccountOrdersResponse = z.infer<typeof accountOrdersResponseSchema>;
export declare const recommendationResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        category: z.ZodEnum<{
            "winter-fashion": "winter-fashion";
            jewelry: "jewelry";
            electronics: "electronics";
            "creator-merchandise": "creator-merchandise";
        }>;
        priceMinor: z.ZodNumber;
        currency: z.ZodEnum<{
            USD: "USD";
            EUR: "EUR";
            GBP: "GBP";
        }>;
        imageUrl: z.ZodString;
        inventory: z.ZodNumber;
        featured: z.ZodBoolean;
        reason: z.ZodEnum<{
            popular_in_store: "popular_in_store";
            same_category: "same_category";
            recent_category: "recent_category";
        }>;
    }, z.core.$strip>>;
    personalization: z.ZodEnum<{
        consented_category_context: "consented_category_context";
        consented_cold_start: "consented_cold_start";
        non_personalized: "non_personalized";
    }>;
}, z.core.$strip>;
export type RecommendationResponse = z.infer<typeof recommendationResponseSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export declare const consentUpdateSchema: z.ZodObject<{
    recommendations: z.ZodBoolean;
    analytics: z.ZodBoolean;
}, z.core.$strip>;
export declare const accountPreferencesSchema: z.ZodObject<{
    locale: z.ZodEnum<{
        "en-US": "en-US";
        "fr-FR": "fr-FR";
        "ja-JP": "ja-JP";
    }>;
    timezone: z.ZodString;
    currency: z.ZodEnum<{
        USD: "USD";
        EUR: "EUR";
        GBP: "GBP";
    }>;
}, z.core.$strip>;
export declare const commerceEventSchema: z.ZodObject<{
    name: z.ZodEnum<{
        product_viewed: "product_viewed";
        recommendation_clicked: "recommendation_clicked";
        search_submitted: "search_submitted";
    }>;
    productId: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<{
        storefront: "storefront";
        pwa: "pwa";
        pos: "pos";
        marketplace: "marketplace";
    }>;
}, z.core.$strip>;
export declare const adminProductUpdateSchema: z.ZodObject<{
    priceMinor: z.ZodOptional<z.ZodNumber>;
    featured: z.ZodOptional<z.ZodBoolean>;
    active: z.ZodOptional<z.ZodBoolean>;
    inventoryOnHand: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const reviewDecisionSchema: z.ZodObject<{
    decision: z.ZodEnum<{
        approve: "approve";
        reject: "reject";
    }>;
}, z.core.$strip>;
export declare const fulfillmentStatusSchema: z.ZodEnum<{
    fulfilling: "fulfilling";
    shipped: "shipped";
    delivered: "delivered";
}>;
export declare const fulfillmentStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        fulfilling: "fulfilling";
        shipped: "shipped";
        delivered: "delivered";
    }>;
}, z.core.$strip>;
export declare const demoSessionRequestSchema: z.ZodObject<{
    role: z.ZodEnum<{
        shopper: "shopper";
        operator: "operator";
    }>;
}, z.core.$strip>;

import { describe, expect, it } from 'vitest';
import {
  accountSchema,
  addCartItemSchema,
  cartResponseSchema,
  checkoutRequestSchema,
  productListQuerySchema,
} from './index';

describe('commerce API contracts', () => {
  it('bounds pagination and applies safe defaults', () => {
    expect(productListQuerySchema.parse({})).toMatchObject({
      limit: 24,
      sort: 'featured',
    });
    expect(productListQuerySchema.safeParse({ limit: 49 }).success).toBe(false);
    expect(productListQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it('rejects invalid quantities and malformed cart items', () => {
    expect(
      addCartItemSchema.safeParse({
        productId: 'not-a-uuid',
        quantity: 100,
      }).success,
    ).toBe(false);
    expect(
      addCartItemSchema.parse({
        productId: '10000000-0000-4000-8000-000000000001',
        quantity: 2,
      }).quantity,
    ).toBe(2);
  });

  it('accepts only the non-card mock payment method', () => {
    expect(
      checkoutRequestSchema.safeParse({
        currency: 'USD',
        paymentMethod: 'mock',
      }).success,
    ).toBe(true);
    expect(
      checkoutRequestSchema.safeParse({
        currency: 'USD',
        paymentMethod: 'credit-card',
        cardNumber: '4111111111111111',
      }).success,
    ).toBe(false);
  });

  it('validates account consent and currency response fields', () => {
    expect(
      accountSchema.safeParse({
        id: '20000000-0000-4000-8000-000000000001',
        displayName: 'Demo shopper',
        role: 'shopper',
        locale: 'en-US',
        timezone: 'America/New_York',
        currency: 'USD',
        recommendationsConsent: false,
        analyticsConsent: false,
      }).success,
    ).toBe(true);
    expect(
      cartResponseSchema.safeParse({
        items: [],
        currency: 'USD',
        subtotalMinor: 0,
        shippingMinor: 0,
        itemCount: 0,
      }).success,
    ).toBe(true);
    expect(
      cartResponseSchema.safeParse({
        items: [],
        currency: 'USD',
        subtotalMinor: 0,
        shippingMinor: -1,
        itemCount: 0,
      }).success,
    ).toBe(false);
  });
});

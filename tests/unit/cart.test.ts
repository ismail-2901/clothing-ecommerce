import { describe, expect, it } from "vitest";
import { addCartItem, calculateCartSummary, normalizeCartItem } from "@/features/cart/cart";

describe("cart service", () => {
  it("adds a product variant to the cart without duplicating the same sku", () => {
    const cart = addCartItem([], {
      sku: "ALS-BLK-S",
      productId: "prod_black_linen_shirt",
      name: "Black Linen Shirt",
      size: "S",
      color: "black",
      price: 245000,
      quantity: 1,
      image: "https://example.com/black-shirt.jpg"
    });

    expect(cart).toEqual([
      {
        sku: "ALS-BLK-S",
        productId: "prod_black_linen_shirt",
        name: "Black Linen Shirt",
        size: "S",
        color: "black",
        price: 245000,
        quantity: 1,
        image: "https://example.com/black-shirt.jpg"
      }
    ]);
  });

  it("calculates totals for the cart using the pricing engine", () => {
    const summary = calculateCartSummary({
      items: [
        {
          sku: "ALS-BLK-S",
          productId: "prod_black_linen_shirt",
          name: "Black Linen Shirt",
          size: "S",
          color: "black",
          price: 245000,
          quantity: 2,
          image: "https://example.com/black-shirt.jpg"
        }
      ],
      shippingFee: 8000,
      coupon: {
        code: "SAVE10",
        kind: "PERCENTAGE",
        value: 10
      },
      now: new Date("2026-09-01T00:00:00Z")
    });

    expect(summary).toEqual({
      subtotal: 490000,
      itemDiscount: 0,
      couponDiscount: 49000,
      shippingFee: 8000,
      grandTotal: 449000,
      appliedCouponCode: "SAVE10"
    });
  });

  it("normalizes a cart line to valid integer values", () => {
    expect(
      normalizeCartItem({
        sku: "ALS-BLK-S",
        productId: "prod_black_linen_shirt",
        name: " Black Linen Shirt ",
        size: " s ",
        color: " Black ",
        price: "245000",
        quantity: "2"
      })
    ).toEqual({
      sku: "ALS-BLK-S",
      productId: "prod_black_linen_shirt",
      name: "Black Linen Shirt",
      size: "S",
      color: "black",
      price: 245000,
      quantity: 2,
      image: ""
    });
  });
});

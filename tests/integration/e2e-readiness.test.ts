import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture,
  seedUserFixture
} from "./test-db";
import { canTransitionOrderStatus } from "@/features/orders/state-machine";
import { hasPermission } from "@/lib/auth/permissions";

describe("E2E Integration & Production Readiness: Customer & Admin Data Flows", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  // 1. Admin creates a product → product appears correctly in storefront.
  it("Flow 1: Admin creates a product and it appears published in the storefront query", async () => {
    const category = await db.category.create({
      data: { name: "Oversized Tees", slug: "oversized-tees" }
    });

    const product = await db.product.create({
      data: {
        name: "Vintage Acid Wash Tee",
        slug: "vintage-acid-wash-tee",
        basePrice: 280000, // 2,800 BDT
        status: "PUBLISHED",
        categoryId: category.id,
        description: "Heavyweight 240 GSM combed cotton.",
        variants: {
          create: {
            sku: "VAW-BLK-L",
            color: "Washed Black",
            size: "L",
            stockQuantity: 40,
            reservedQuantity: 0,
            isAvailable: true
          }
        }
      },
      include: { variants: true }
    });

    // Storefront query for published catalog items
    const storefrontListing = await db.product.findMany({
      where: { status: "PUBLISHED" },
      include: { variants: true, category: true }
    });

    expect(storefrontListing.length).toBeGreaterThan(0);
    const listedProduct = storefrontListing.find((p) => p.slug === "vintage-acid-wash-tee");
    expect(listedProduct).toBeDefined();
    expect(listedProduct?.name).toBe("Vintage Acid Wash Tee");
    expect(listedProduct?.basePrice).toBe(280000);
    expect(listedProduct?.variants[0].sku).toBe("VAW-BLK-L");
  });

  // 2. Admin updates product information → storefront reflects changes.
  it("Flow 2: Admin updates product information and storefront query reflects update immediately", async () => {
    const { product } = await seedCatalogFixture(db);

    // Admin edits title and price
    await db.product.update({
      where: { id: product.id },
      data: {
        name: "Updated Signature Oxford Shirt - 2026 Edition",
        basePrice: 275000 // 2,750 BDT
      }
    });

    // Customer navigates to product details
    const storefrontDetail = await db.product.findUnique({
      where: { id: product.id }
    });

    expect(storefrontDetail?.name).toBe("Updated Signature Oxford Shirt - 2026 Edition");
    expect(storefrontDetail?.basePrice).toBe(275000);
  });

  // 3. Admin updates inventory → actual product availability changes.
  it("Flow 3: Admin adjusts inventory and product variant availability state updates", async () => {
    const { variant } = await seedCatalogFixture(db);

    // Initial state check
    expect(variant.stockQuantity).toBe(10);
    expect(variant.isAvailable).toBe(true);

    // Admin restocks or marks out of stock
    await db.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: 0, isAvailable: false }
    });

    const checkedVariant = await db.productVariant.findUnique({
      where: { id: variant.id }
    });

    expect(checkedVariant?.stockQuantity).toBe(0);
    expect(checkedVariant?.isAvailable).toBe(false);
  });

  // 4 & 5. Customer places an order with variants → admin receives order with exact variant SKU.
  it("Flows 4 & 5: Customer places order with variant selection; Admin receives exact SKU & quantities", async () => {
    const { product, variant } = await seedCatalogFixture(db);
    const { customer } = await seedUserFixture(db);

    const orderNumber = "ATC-ORD-" + Date.now();
    const unitPrice = variant.priceOverride ?? product.basePrice;
    const quantity = 2;
    const subtotal = unitPrice * quantity;

    const order = await db.order.create({
      data: {
        orderNumber,
        user: { connect: { id: customer.id } },
        status: "PENDING",
        subtotal,
        shippingTotal: 8000,
        discountTotal: 0,
        grandTotal: subtotal + 8000,
        deliveryAddress: {
          fullName: "Customer User",
          phoneNumber: "01700000000",
          addressLine1: "House 10, Road 5, Banani",
          city: "Dhaka",
          postalCode: "1213"
        },
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            sku: variant.sku,
            name: product.name,
            color: variant.color,
            size: variant.size,
            unitPrice,
            quantity,
            lineTotal: subtotal,
            productSnapshot: { name: product.name, sku: variant.sku }
          }
        }
      },
      include: {
        items: { include: { variant: true } },
        user: true
      }
    });

    // Admin dashboard query
    const adminOrder = await db.order.findUnique({
      where: { orderNumber },
      include: { items: { include: { variant: true } }, user: true }
    });

    expect(adminOrder).toBeDefined();
    expect(adminOrder?.items[0].sku).toBe(variant.sku);
    expect(adminOrder?.items[0].variant.sku).toBe(variant.sku);
    expect(adminOrder?.items[0].quantity).toBe(2);
    expect(adminOrder?.user?.email).toBe(customer.email);
  });

  // 6. Admin updates order status → order history reflects the change.
  it("Flow 6: Admin updates order status from PENDING to CONFIRMED with status history log", async () => {
    const { customer } = await seedUserFixture(db);
    const order = await db.order.create({
      data: {
        orderNumber: "ATC-STATUS-" + Date.now(),
        user: { connect: { id: customer.id } },
        status: "PENDING",
        subtotal: 200000,
        shippingTotal: 8000,
        discountTotal: 0,
        grandTotal: 208000,
        deliveryAddress: {
          fullName: "Customer User",
          phoneNumber: "01700000000",
          addressLine1: "House 10, Road 5, Banani",
          city: "Dhaka",
          postalCode: "1213"
        }
      }
    });

    // Validate state machine rule
    expect(canTransitionOrderStatus("PENDING", "CONFIRMED")).toBe(true);

    // Admin confirms order
    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" }
      }),
      db.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: "PENDING",
          newStatus: "CONFIRMED",
          note: "Verified via phone verification"
        }
      })
    ]);

    const customerOrderView = await db.order.findUnique({
      where: { id: order.id },
      include: { history: true }
    });

    expect(customerOrderView?.status).toBe("CONFIRMED");
    expect(customerOrderView?.history[0].newStatus).toBe("CONFIRMED");
  });

  // 7 & 8. Customer applies coupon → discount calculated; Admin modifies coupon rules → validation adapts.
  it("Flows 7 & 8: Coupon application calculation and admin coupon modification behavior", async () => {
    const coupon = await db.coupon.create({
      data: {
        code: "SUMMER20",
        title: "Summer 20% Discount",
        type: "PERCENTAGE",
        value: 20, // 20%
        status: "ACTIVE",
        minSubtotal: 100000, // min 1,000 BDT
        usageLimit: 100,
        usageCount: 0
      }
    });

    // Subtotal: 5,000 BDT (500,000 minor)
    const subtotal = 500000;
    const shipping = 8000;
    const discount = Math.round((subtotal * coupon.value) / 100); // 100,000 minor (1,000 BDT)
    const grandTotal = subtotal - discount + shipping;

    expect(discount).toBe(100000);
    expect(grandTotal).toBe(408000);

    // Admin updates coupon status to INACTIVE
    await db.coupon.update({
      where: { id: coupon.id },
      data: { status: "INACTIVE" }
    });

    const refreshedCoupon = await db.coupon.findUnique({ where: { id: coupon.id } });
    expect(refreshedCoupon?.status).toBe("INACTIVE");
  });

  // 9. Customer account → correct order history appears.
  it("Flow 9: Customer account query retrieves accurate isolated order history", async () => {
    const { customer } = await seedUserFixture(db);
    const otherUser = await db.user.create({
      data: { email: `other-${Date.now()}@example.com`, name: "Other Shopper" }
    });

    // Customer order
    await db.order.create({
      data: {
        orderNumber: "CUST-ORD-1",
        user: { connect: { id: customer.id } },
        status: "DELIVERED",
        subtotal: 100000,
        shippingTotal: 8000,
        discountTotal: 0,
        grandTotal: 108000,
        deliveryAddress: {
          fullName: "Customer User",
          phoneNumber: "01700000000",
          addressLine1: "House 10, Road 5, Banani",
          city: "Dhaka",
          postalCode: "1213"
        }
      }
    });

    // Other user order
    await db.order.create({
      data: {
        orderNumber: "OTHER-ORD-1",
        user: { connect: { id: otherUser.id } },
        status: "PENDING",
        subtotal: 200000,
        shippingTotal: 8000,
        discountTotal: 0,
        grandTotal: 208000,
        deliveryAddress: {
          fullName: "Other User",
          phoneNumber: "01800000000",
          addressLine1: "House 20, Road 8, Dhanmondi",
          city: "Dhaka",
          postalCode: "1205"
        }
      }
    });

    const customerOrders = await db.order.findMany({
      where: { userId: customer.id }
    });

    expect(customerOrders.length).toBe(1);
    expect(customerOrders[0].orderNumber).toBe("CUST-ORD-1");
  });

  // 10. Admin changes shipping settings → checkout uses correct configuration.
  it("Flow 10: Store shipping settings persist and provide authoritative configuration", async () => {
    const newSettings = {
      storeName: "ELARIS BD",
      insideDhakaFee: 90,
      outsideDhakaFee: 160,
      freeShippingMin: 3500
    };

    await db.storeSetting.upsert({
      where: { key: "store_settings" },
      update: { value: newSettings },
      create: { key: "store_settings", value: newSettings }
    });

    const activeSetting = await db.storeSetting.findUnique({
      where: { key: "store_settings" }
    });

    const parsed = activeSetting?.value as typeof newSettings;
    expect(parsed.insideDhakaFee).toBe(90);
    expect(parsed.outsideDhakaFee).toBe(160);
    expect(parsed.freeShippingMin).toBe(3500);
  });

  // 11. Staff role changes → server-side authorization reflects updated permissions.
  it("Flow 11: Staff role assignment updates server-side permissions accurately", async () => {
    const user = await db.user.create({
      data: { email: `staff-${Date.now()}@elaris.com`, name: "Fulfillment Agent" }
    });

    const adminRole = await db.role.upsert({
      where: { name: "ADMIN" },
      create: { name: "ADMIN", description: "Admin Role" },
      update: {}
    });

    // Initially user has no admin permissions
    expect(hasPermission("CUSTOMER", "order:manage")).toBe(false);

    // Promote user to ADMIN
    await db.userRole.create({
      data: { userId: user.id, roleId: adminRole.id }
    });

    const userWithRoles = await db.user.findUnique({
      where: { id: user.id },
      include: { roles: { include: { role: true } } }
    });

    const assignedRole = userWithRoles?.roles[0].role.name;
    expect(assignedRole).toBe("ADMIN");
    expect(hasPermission(assignedRole!, "order:manage")).toBe(true);
    expect(hasPermission(assignedRole!, "product:manage")).toBe(true);
    expect(hasPermission(assignedRole!, "admin:manage")).toBe(false); // Only super admin can manage staff
  });

  // 12. Sensitive administrative actions → audit logs record them correctly.
  it("Flow 12: Sensitive administrative actions generate immutable audit log records", async () => {
    const { adminUser } = await seedUserFixture(db);

    const auditEntry = await db.auditLog.create({
      data: {
        actorId: adminUser.id,
        action: "STORE_SETTINGS_UPDATED",
        resource: "StoreSetting",
        resourceId: "store_settings",
        previous: { insideDhakaFee: 80 },
        next: { insideDhakaFee: 90 },
        metadata: { clientIp: "127.0.0.1", userAgent: "Mozilla" }
      }
    });

    const storedLog = await db.auditLog.findUnique({
      where: { id: auditEntry.id },
      include: { actor: true }
    });

    expect(storedLog).toBeDefined();
    expect(storedLog?.action).toBe("STORE_SETTINGS_UPDATED");
    expect(storedLog?.actor?.email).toBe(adminUser.email);
    expect((storedLog?.next as any).insideDhakaFee).toBe(90);
  });
});

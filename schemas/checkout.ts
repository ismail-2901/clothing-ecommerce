import { z } from "zod";

export const checkoutContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().trim().min(7).max(30).optional()
}).refine((value) => value.email || value.phone, {
  message: "Email or phone is required."
});

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  line1: z.string().trim().min(5).max(180),
  line2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(80).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().length(2).default("BD")
});

export const checkoutSubmissionSchema = z.object({
  contact: checkoutContactSchema,
  deliveryAddress: addressSchema,
  shippingMethodId: z.string().min(1),
  paymentProvider: z.enum(["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"]),
  couponCode: z.string().trim().max(40).optional()
});

export type CheckoutSubmission = z.infer<typeof checkoutSubmissionSchema>;


import { z } from "zod";

export const cartLineSchema = z.object({
  variantSku: z.string().min(1),
  quantity: z.number().int().min(1).max(99)
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(2).max(40).toUpperCase()
});

export type CartLineInputSchema = z.infer<typeof cartLineSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;


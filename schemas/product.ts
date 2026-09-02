import { z } from "zod";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const productVariantSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  color: z.string().trim().min(1).max(40),
  size: z.string().trim().min(1).max(20),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional(),
  stockQuantity: z.number().int().min(0),
  reservedQuantity: z.number().int().min(0).default(0)
});

export const productMutationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.string().uuid(),
  collectionId: z.string().uuid().optional(),
  basePrice: z.number().int().min(0),
  salePrice: z.number().int().min(0).optional(),
  material: z.string().trim().max(500).optional(),
  careInstructions: z.string().trim().max(1000).optional(),
  status: productStatusSchema,
  variants: z.array(productVariantSchema).min(1),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([])
});

export type ProductMutationInput = z.infer<typeof productMutationSchema>;


import { z } from "zod";

export const assistantIntentSchema = z.enum([
  "PRODUCT_SEARCH",
  "PRODUCT_QUESTION",
  "ORDER_STATUS",
  "DELIVERY",
  "RETURN",
  "REFUND",
  "ACCOUNT",
  "PAYMENT",
  "GENERAL_SUPPORT",
  "HUMAN_SUPPORT",
  "UNKNOWN"
]);

export const productFilterSchema = z.object({
  category: z.string().optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  fit: z.string().optional(),
  maxPrice: z.number().int().positive().optional(),
  size: z.string().optional(),
  availability: z.literal("IN_STOCK").optional(),
  query: z.string().optional()
});

export const assistantStructuredOutputSchema = z.object({
  intent: assistantIntentSchema,
  filters: productFilterSchema.default({}),
  response: z.string().min(1)
});

export type AssistantIntent = z.infer<typeof assistantIntentSchema>;
export type ProductFilters = z.infer<typeof productFilterSchema>;
export type AssistantStructuredOutput = z.infer<typeof assistantStructuredOutputSchema>;


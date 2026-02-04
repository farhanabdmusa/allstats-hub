import z from "zod";

const GetLikeSchema = z.object({
  product_id: z.string(),
  product_type: z.int(),
  mfd: z.string(),
});

export const GetLikeSchemaBatch = z.object({
  product_id: z.string().array().min(1, {
    error: "Input Error: The product ID list cannot be empty.",
  }),
  product_type: z.int(),
  mfd: z.string(),
});

export default GetLikeSchema;

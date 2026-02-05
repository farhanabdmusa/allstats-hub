import z from "zod";

const LikeSchema = z.object({
  user_id: z.int(),
  product_type: z.int(),
  mfd: z.string(),
  product_id: z.string(),
  like_status: z.boolean(),
});

export default LikeSchema;

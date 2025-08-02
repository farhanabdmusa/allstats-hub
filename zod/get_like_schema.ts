import z from "zod";

const GetLikeSchema = z.object({
    product_id: z.string(),
    product_type: z.int(),
    mfd: z.string(),
});

export default GetLikeSchema;
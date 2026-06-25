import z from "zod";

const ConnectEmailSchema = z.object({
  email: z.email(),
  type: z.coerce.number().min(1).max(3),
});

const ConnectAppleSchema = z.object({
  identity_token: z.string(),
  authorization: z.string(),
  email: z.email().optional().nullable(),
  given_name: z.string().optional().nullable(),
  family_name: z.string().optional().nullable(),
});

const DisconnectEmailSchema = z.object({
  type: z.coerce.number().min(1).max(3),
});

export { ConnectEmailSchema, DisconnectEmailSchema, ConnectAppleSchema };

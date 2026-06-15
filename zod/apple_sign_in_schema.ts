import z from "zod";

const AppleSignInPayload = z.object({
  uuid: z.string("UUID is required"),
  identity_token: z.string(),
  authorization: z.string(),
  email: z.email().optional().nullable(),
  given_name: z.string().optional().nullable(),
  family_name: z.string().optional().nullable(),
});

export { AppleSignInPayload };

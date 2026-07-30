import z from "zod";
import { UserFavoritesPayload, UserPreferencePayload } from "./user_schema";

const AppleSignInPayload = z.object({
  uuid: z.string("UUID is required"),
  identity_token: z.string(),
  authorization: z.string(),
  email: z.email().optional().nullable(),
  given_name: z.string().optional().nullable(),
  family_name: z.string().optional().nullable(),
  user_preference: UserPreferencePayload.clone(),
  user_favorites: UserFavoritesPayload.clone().array().optional(),
});

export { AppleSignInPayload };

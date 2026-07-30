import z from "zod";
import { UserFavoritesPayload, UserPreferencePayload } from "./user_schema";

const GoogleSignInPayload = z.object({
  uuid: z.string("UUID is required"),
  id_token: z.string(),
  user_preference: UserPreferencePayload.clone(),
  user_favorites: UserFavoritesPayload.clone().array().optional(),
});

export { GoogleSignInPayload };

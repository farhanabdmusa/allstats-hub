export const ISSUER = "https://bps.go.id";
export const APP_KEY = process.env.ALLSTATS_APP_KEY;
export const ALLOWED_ORIGIN = "Allstats BPS";
export const SECRET_KEY = new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY);
export const AUDIENCE = "allstats-mobile";
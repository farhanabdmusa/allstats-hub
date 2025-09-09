export const ALLOWED_ORIGIN = "Allstats BPS";
export const APP_KEY = process.env.ALLSTATS_SECRET_KEY;
// JWT
export const SECRET_KEY = new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY);
export const ISSUER = "https://bps.go.id";
export const AUDIENCE = "allstats-mobile";
export const APP_NAME = "Allstats Hub";
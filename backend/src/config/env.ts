import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'vyora_super_secret_jwt_access_token_key_2026_saas',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'vyora_super_secret_jwt_refresh_token_key_2026_saas',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

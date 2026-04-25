import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3001;
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
export const DEEPSEEK_API_URL = 'https://api.deepseek.com';

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string(),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    JWT_SECRET: zod_1.z.string(),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    LASTFM_API_KEY: zod_1.z.string().default(''),
    LASTFM_SECRET: zod_1.z.string().default(''),
    YOUTUBE_API_KEY: zod_1.z.string().default(''),
    OAUTH_GOOGLE_CLIENT_ID: zod_1.z.string().default(''),
    OAUTH_GOOGLE_CLIENT_SECRET: zod_1.z.string().default(''),
    OAUTH_GITHUB_CLIENT_ID: zod_1.z.string().default(''),
    OAUTH_GITHUB_CLIENT_SECRET: zod_1.z.string().default(''),
    CLIENT_WEB_URL: zod_1.z.string().default('http://localhost:5173'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map
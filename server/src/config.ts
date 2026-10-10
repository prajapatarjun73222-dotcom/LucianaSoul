import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  siteUrl: (process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/$/, ''),
  keepAlive: {
    // Render sets RENDER_EXTERNAL_URL automatically; KEEP_ALIVE_URL overrides it.
    url: (process.env.KEEP_ALIVE_URL ?? process.env.RENDER_EXTERNAL_URL ?? '').replace(/\/$/, ''),
    intervalMinutes: Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES ?? 10),
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME ?? 'Developer',
  },
};

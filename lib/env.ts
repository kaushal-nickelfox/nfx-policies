/**
 * Runtime environment variable validation.
 * Import this in server-side code to get typed, validated env vars.
 * Missing required vars will throw a clear error at startup.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Copy .env.example to .env.local and fill in all required values.`
    );
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name];
}

export const env = {
  // NextAuth
  AUTH_SECRET: requireEnv('AUTH_SECRET'),
  NEXTAUTH_URL: optionalEnv('NEXTAUTH_URL') ?? 'http://localhost:3000',

  // Azure Entra ID (matches authOptions.ts variable names)
  AUTH_MICROSOFT_ENTRA_ID_ID: requireEnv('AUTH_MICROSOFT_ENTRA_ID_ID'),
  AUTH_MICROSOFT_ENTRA_ID_SECRET: requireEnv('AUTH_MICROSOFT_ENTRA_ID_SECRET'),
  AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: requireEnv('AUTH_MICROSOFT_ENTRA_ID_TENANT_ID'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Microsoft Graph (matches graphClient.ts variable names)
  MICROSOFT_GRAPH_CLIENT_ID: optionalEnv('MICROSOFT_GRAPH_CLIENT_ID'),
  MICROSOFT_GRAPH_CLIENT_SECRET: optionalEnv('MICROSOFT_GRAPH_CLIENT_SECRET'),
  MICROSOFT_GRAPH_TENANT_ID: optionalEnv('MICROSOFT_GRAPH_TENANT_ID'),
} as const;

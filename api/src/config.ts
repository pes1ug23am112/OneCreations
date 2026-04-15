// Shared config, populated once at startup from the validated env.
// Import this from anywhere instead of re-reading process.env.

export type AppConfig = {
  port: number;
  corsOrigins: string[];
  mongoUri: string;
  email: { from: string; apiKey?: string };
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
  } | null;
};

let cfg: AppConfig | null = null;

export function setConfig(next: AppConfig): void {
  cfg = next;
}

export function getConfig(): AppConfig {
  if (!cfg) throw new Error('config not initialized — call setConfig() at startup');
  return cfg;
}

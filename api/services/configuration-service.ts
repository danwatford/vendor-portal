export interface VendorPortalConfig {
  spSiteUrl: string;
  spClientId: string;
  spClientSecret: string;

  wcSiteUrl: string;
  wcKey: string;
  wcSecret: string;

  wcWebhookSecret: string;

  wcDepositProductId: number;
}

function getEnvNumberOrThrow(envName: string): number {
  const stringVal = getEnvOrThrow(envName);
  return parseInt(stringVal);
}

function getEnvOrThrow(envName: string): string {
  if (process.env[envName] !== undefined) {
    return process.env[envName]!;
  } else {
    throw new Error("Environment variable not defined: " + envName);
  }
}

const config: VendorPortalConfig = {
  spSiteUrl: getEnvOrThrow("VENDORS_SITE"),
  spClientId: getEnvOrThrow("VENDORS_CLIENT_ID"),
  spClientSecret: getEnvOrThrow("VENDORS_CLIENT_SECRET"),
  wcSiteUrl: getEnvOrThrow("WOOCOMMERCE_SITE"),
  wcKey: getEnvOrThrow("WOOCOMMERCE_CONSUMER_KEY"),
  wcSecret: getEnvOrThrow("WOOCOMMERCE_CONSUMER_SECRET"),
  wcWebhookSecret: getEnvOrThrow("WOOCOMMERCE_WEBHOOK_SECRET"),
  wcDepositProductId: getEnvNumberOrThrow("WOOCOMMERCE_DEPOSIT_PRODUCT_ID"),
};

export function getVendorPortalConfig(): Readonly<VendorPortalConfig> {
  return { ...config };
}

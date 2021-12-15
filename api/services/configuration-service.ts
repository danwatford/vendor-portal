export interface VendorPortalConfig {
  spSiteUrl: string;
  spClientId: string;
  spClientSecret: string;

  wcSiteUrl: string;
  wcKey: string;
  wcSecret: string;
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
};

export function getVendorPortalConfig(): Readonly<VendorPortalConfig> {
  return { ...config };
}

import { createHmac } from "crypto";
import { PersistedOrder } from "../interfaces/woocommerce";
import { depositOrderUpdatedForApplication } from "./applications-service";
import { getVendorPortalConfig } from "./configuration-service";

const config = getVendorPortalConfig();

export const webhookHandler = (
  resource: string,
  event: string,
  payload: any
) => {
  if (resource === "order" && event === "updated") {
    processOrderUpdates(payload as PersistedOrder);
  }
};

export const isSignatureValid = (
  payload: Buffer,
  signature: string
): boolean => {
  const hmac = createHmac("sha256", config.wcWebhookSecret);
  hmac.update(payload);
  const hash = hmac.digest("base64");
  return signature === hash;
};

const processOrderUpdates = (order: PersistedOrder) => {
  // Does this order refer to an application?
  const applicationIdString = getOrderMetadataValue(
    order,
    "VendorPortalApplicationId"
  );
  if (applicationIdString) {
    const applicationId = parseInt(applicationIdString);
    const intent = getOrderMetadataValue(order, "VendorPortalOrderIntent");

    if (intent === "Deposit") {
      // The deposit payment has been made.
      depositOrderUpdatedForApplication(applicationId, order);
    }
  }
};

const getOrderMetadataValue = (
  order: PersistedOrder,
  key: string
): string | undefined => {
  const metaData = order.meta_data ?? [];
  const metaDataItem = metaData.find((item) => item.key === key);
  return metaDataItem?.value;
};

import WooCommerceRestApi from "@reformosoftware/woocommerce-rest-api";
import { PersistableOrder, PersistedOrder } from "../interfaces/woocommerce";

import { getVendorPortalConfig } from "./configuration-service";

const vendorPortalConfig = getVendorPortalConfig();

const url: string = vendorPortalConfig.wcSiteUrl;
const consumerKey: string = vendorPortalConfig.wcKey;
const consumerSecret: string = vendorPortalConfig.wcSecret;

const api = new WooCommerceRestApi({
  url,
  consumerKey,
  consumerSecret,
  version: "wc/v3",
  queryStringAuth: false,
});

export type WooCommerceServiceErrorCode = "UNKNOWN_ERROR";

export type WooCommerceServiceError<T extends WooCommerceServiceErrorCode> = {
  code: T;
  message: string;
};

type OrError<T, U extends WooCommerceServiceErrorCode> = readonly [
  WooCommerceServiceError<U> | null,
  T | null
];

function success<T>(result: T): readonly [null, T] {
  return [null, result];
}

function fail<T extends WooCommerceServiceErrorCode>(
  code: T,
  message?: string
): readonly [WooCommerceServiceError<T>, null] {
  return [createError(code, message), null];
}

function createError<T extends WooCommerceServiceErrorCode>(
  code: T,
  message?: string
): WooCommerceServiceError<T> {
  return {
    code,
    message: message ?? "",
  };
}

export const createOrder = async (
  order: PersistableOrder
): Promise<OrError<PersistedOrder, "UNKNOWN_ERROR">> => {
  const createOrderResponse = await api.post("orders", order);

  console.log("Create order response", createOrderResponse);
  if (createOrderResponse.status === 201) {
    return success(createOrderResponse.data);
  } else {
    return fail("UNKNOWN_ERROR");
  }
};

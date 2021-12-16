import WooCommerceRestApi from "@reformosoftware/woocommerce-rest-api";
import { error, OrError, success } from "../interfaces/error";
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

export const createOrder = async (
  order: PersistableOrder
): Promise<OrError<PersistedOrder, "UNKNOWN_ERROR">> => {
  const createOrderResponse = await api.post("orders", order);

  if (createOrderResponse.status === 201) {
    return success(createOrderResponse.data);
  } else {
    return error("UNKNOWN_ERROR");
  }
};

export const getOrder = async (
  orderNumber: number
): Promise<OrError<PersistedOrder, "NOT_FOUND" | "UNKNOWN_ERROR">> => {
  try {
    const getOrderResponse = await api.get("orders/" + orderNumber);
    return success(getOrderResponse.data);
  } catch (err) {
    const woocommerceErrorCode = err?.response?.data?.code;
    if (woocommerceErrorCode === "woocommerce_rest_shop_order_invalid_id") {
      return error("NOT_FOUND");
    } else {
      console.error("Error while getting order", err.response);
      return error("UNKNOWN_ERROR");
    }
  }
};

export const deleteOrder = async (
  orderNumber: number
): Promise<OrError<null, "NOT_FOUND" | "UNKNOWN_ERROR">> => {
  try {
    const deleteOrderResponse = await api.delete("orders/" + orderNumber);
    return success(deleteOrderResponse.data);
  } catch (err) {
    const woocommerceErrorCode = err?.response?.data?.code;
    if (woocommerceErrorCode === "woocommerce_rest_shop_order_invalid_id") {
      return error("NOT_FOUND");
    } else {
      console.error("Error while deleting order", err.response);
      return error("UNKNOWN_ERROR");
    }
  }
};

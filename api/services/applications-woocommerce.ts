import { PersistedCraftFairApplication } from "../interfaces/applications";
import { error, OrError, success } from "../interfaces/error";
import {
  Billing,
  PersistableOrder,
  PersistedOrder,
} from "../interfaces/woocommerce";
import { getVendorPortalConfig } from "./configuration-service";
import { createOrder, deleteOrder, getOrder } from "./woocommerce-service";

const config = getVendorPortalConfig();

// Create an order in WooCommerce for payment of the deposit related to the given application.
// Returns the URL which can be used to pay for the order.
export const createDepositOrder = async (
  application: PersistedCraftFairApplication
): ReturnType<typeof createOrder> => {
  const billing: Billing = {
    company: application.tradingName,
    email: application.email,
    first_name: application.contactFirstNames,
    last_name: application.contactLastName,
    address_1: application.addressLine1,
    address_2: application.addressLine2 ?? "",
    city: application.city,
    state: application.state,
    postcode: application.postcode,
    country: application.country,
    phone: application.landline ?? application.mobile ?? "",
  };

  const newDepositOrder: PersistableOrder = {
    billing,
    currency: "GBP",
    line_items: [
      {
        name: "Deposit for application for a craft fair or catering pitch at Broadstairs Folk Week.",
        product_id: config.wcDepositProductId,
      },
    ],
    fee_lines: [],
    meta_data: [
      {
        key: "VendorPortalApplicationId",
        value: "" + application.dbId,
      },
      {
        key: "VendorPortalOrderIntent",
        value: "Deposit",
      },
    ],
  };

  return createOrder(newDepositOrder);
};

export const getDepositOrder = async (
  application: PersistedCraftFairApplication
): Promise<
  OrError<
    PersistedOrder,
    "ORDER_NOT_CREATED" | "ORDER_NOT_FOUND" | "UNKNOWN_ERROR"
  >
> => {
  if (application.depositOrderNumber) {
    const [err, order] = await getOrder(application.depositOrderNumber);
    if (err) {
      switch (err.code) {
        case "NOT_FOUND":
          return error("ORDER_NOT_FOUND");

        case "UNKNOWN_ERROR":
          return error("UNKNOWN_ERROR");

        default:
          const _exhaustiveCheck: never = err.code;
          return _exhaustiveCheck;
      }
    }
    return success(order);
  } else {
    return error("ORDER_NOT_CREATED");
  }
};

export const deleteDepositOrder = async (
  application: PersistedCraftFairApplication
): Promise<
  OrError<void, "ORDER_NOT_FOUND" | "UNKNOWN_ERROR" | "ORDER_ALREADY_PAID">
> => {
  // Before deleting the order, check it hasn't already been paid.
  if (application.depositOrderNumber) {
    const [err, order] = await getOrder(application.depositOrderNumber);
    if (err) {
      switch (err.code) {
        case "NOT_FOUND":
          return error("ORDER_NOT_FOUND");

        case "UNKNOWN_ERROR":
          return error("UNKNOWN_ERROR");

        default:
          const _exhaustiveCheck: never = err.code;
          return _exhaustiveCheck;
      }
    }
    if (order?.status === "pending") {
      const [deleteErr] = await deleteOrder(order.id);
      if (deleteErr) {
        switch (deleteErr.code) {
          case "NOT_FOUND":
            return error("ORDER_NOT_FOUND");

          case "UNKNOWN_ERROR":
            return error("UNKNOWN_ERROR");

          default:
            const _exhaustiveCheck: never = deleteErr.code;
            return _exhaustiveCheck;
        }
      } else {
        return success(null);
      }
    } else {
      return error("ORDER_ALREADY_PAID");
    }
  } else {
    return success(null);
  }
};

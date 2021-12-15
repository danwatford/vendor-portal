import { PersistedCraftFairApplication } from "../interfaces/applications";
import { Billing, PersistableOrder } from "../interfaces/woocommerce";
import { createOrder } from "./woocommerce-service";

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
    fee_lines: [
      {
        name: "Deposit for Craft Fair or Catering Vendor Application",
        total: "100",
      },
    ],
  };

  return createOrder(newDepositOrder);
};

import { URL } from "url";
import {
  CraftFairApplication,
  PersistedCraftFairApplication,
} from "../interfaces/applications";
import { error, OrError, success } from "../interfaces/error";
import { User } from "../interfaces/user";
import { PersistedOrder } from "../interfaces/woocommerce";
import { getTotalCraftFairApplicationCost } from "./applications-pricing";
import {
  createCraftApplicationListItem,
  deleteCraftApplicationListItem,
  getCraftApplicationById,
  getCraftApplicationByIdAndUserId,
  getCraftApplicationsByUserId,
  updateCraftApplicationListItem,
} from "./applications-sp";
import {
  createDepositOrder,
  deleteDepositOrder,
  getDepositOrder,
} from "./applications-woocommerce";
import { getVendorPortalConfig } from "./configuration-service";

const config = getVendorPortalConfig();

export type ApplicationServiceErrorCode =
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_CONFLICT"
  | "APPLICATION_NOT_PAYABLE";

interface ProgressApplicationContext {
  depositOrder?: PersistedOrder;
}

export const getCraftApplicationsForUser = async (
  userId: string
): Promise<CraftFairApplication[]> => {
  return getCraftApplicationsByUserId(userId);
};

export const submitCraftFairApplication = async (
  application: CraftFairApplication,
  user: User
): Promise<CraftFairApplication> => {
  const createdOrUpdatedApplication = await createOrUpdateCraftApplication(
    application,
    user
  );
  return progressApplication(createdOrUpdatedApplication, {});
};

export const deleteApplication = async (
  dbId: number,
  user: User
): Promise<
  OrError<
    null,
    "APPLICATION_NOT_FOUND" | "APPLICATION_CONFLICT" | "UNKNOWN_ERROR"
  >
> => {
  const application = await getCraftApplication(dbId, user.userId);

  if (application) {
    // Applications can only be deleted if the deposit has not yet been paid.
    if (
      application.status === "Submitted" ||
      application.status === "Pending Deposit"
    ) {
      // The assocaited WooCommerce order for deposit payment will also need to be deleted.
      const [deleteDepositOrderErr] = await deleteDepositOrder(application);
      if (deleteDepositOrderErr) {
        switch (deleteDepositOrderErr.code) {
          case "ORDER_ALREADY_PAID":
            // If the deposit has already been paid then the application should have already advanced from the Pending Deposit status.
            // Run the order progressor to get the application updated.
            await progressApplication(application, {});
            return error(
              "APPLICATION_CONFLICT",
              "Cannot delete applications which are have status other than 'Pending Deposit'"
            );

          case "ORDER_NOT_FOUND":
            // The order doesn't exist, therefore permit the application to be deleted.
            await deleteCraftApplicationListItem(application);
            return success(null);

          case "UNKNOWN_ERROR":
            return error("UNKNOWN_ERROR");

          default:
            const _exhaustiveCheck: never = deleteDepositOrderErr.code;
            return _exhaustiveCheck;
        }
      } else {
        await deleteCraftApplicationListItem(application);
        return success(null);
      }
    } else {
      return error(
        "APPLICATION_CONFLICT",
        "Cannot delete applications which are have status other than 'Pending Deposit'"
      );
    }
  } else {
    return fail("APPLICATION_NOT_FOUND");
  }
};

export const getPaymentUrl = async (
  dbId: number,
  user: User
): Promise<
  OrError<string, "APPLICATION_NOT_FOUND" | "APPLICATION_NOT_PAYABLE">
> => {
  const application = await getCraftApplication(dbId, user.userId);

  if (application) {
    // Applications are only payable in certain states
    if (application.status === "Pending Deposit") {
      const paymentUrl = new URL(
        `/checkout/order-pay/${application.depositOrderNumber}/`,
        config.wcSiteUrl
      );
      paymentUrl.searchParams.append("pay_for_order", "true");
      paymentUrl.searchParams.append("key", application.depositOrderKey ?? "");
      return success(paymentUrl.href);
    } else if (application.status === "Accepted Pending Payment") {
      const paymentUrl = new URL(
        `/checkout/order-pay/${application.depositOrderNumber}/`,
        config.wcSiteUrl
      );
      paymentUrl.searchParams.append("pay_for_order", "true");
      paymentUrl.searchParams.append("key", application.depositOrderKey ?? "");
      return success(paymentUrl.href);
    } else {
      return error(
        "APPLICATION_NOT_PAYABLE",
        "No payment currently required for application."
      );
    }
  } else {
    return fail("APPLICATION_NOT_FOUND");
  }
};

export const depositOrderUpdatedForApplication = async (
  id: number,
  order: PersistedOrder
) => {
  const application = await getCraftApplicationById(id);
  if (application) {
    progressApplication(application, { depositOrder: order });
  }
};

const progressApplication = async (
  application: PersistedCraftFairApplication,
  context: ProgressApplicationContext
): Promise<PersistedCraftFairApplication> => {
  switch (application.status) {
    case "Submitted":
      const [error, persistedOrder] = await createDepositOrder(application);
      if (error) {
        switch (error.code) {
          case "UNKNOWN_ERROR":
            // The deposit order has not been created, therefore don't advance the status of the application.
            // Next time the user re-submits the application there will be an attempt create the deposit order,
            // alternatively another process may intervene.
            return application;

          default:
            const _exhaustiveCheck: never = error.code;
            return _exhaustiveCheck;
        }
      }
      application.depositOrderNumber = persistedOrder?.number;
      application.depositOrderKey = persistedOrder?.order_key;
      application.status = "Pending Deposit";
      return updateCraftApplicationListItem(application);

    case "Pending Deposit":
      // Check to see if an order has been created and if it has been paid.
      if (!context.depositOrder) {
        const [getDepositOrderErr, depositOrder] = await getDepositOrder(
          application
        );
        if (getDepositOrderErr) {
          switch (getDepositOrderErr.code) {
            case "UNKNOWN_ERROR":
              // We don't know what error has occurred, so cannot make any assumptions about the existence of
              // a deposit order.
              // Don't progress the application further.
              return application;

            case "ORDER_NOT_CREATED":
              // No order has been created, but the application has been put in the Pending Deposit status incorrectly.
              // Progress the application as if it was in the Submitted status.
              application.status = "Submitted";
              return progressApplication(application, context);

            case "ORDER_NOT_FOUND":
              // The order cannot be found. Possibly deleted. Progress the application as if it was in the Submitted status
              // which will force creation of a new order.
              application.status = "Submitted";
              return progressApplication(application, context);

            default:
              const _exhaustiveCheck: never = getDepositOrderErr.code;
              return _exhaustiveCheck;
          }
        } else {
          if (depositOrder) {
            context.depositOrder = depositOrder;
          }
        }
      }

      if (context.depositOrder) {
        const depositOrder = context.depositOrder;

        if (depositOrder?.status === "completed") {
          // Deposit has been paid, therefore advance status of application.
          application.status = "Pending Document Upload";
          return updateCraftApplicationListItem(application);
        }
      }
      return application;

    default:
      return application;
  }
};

const getCraftApplication = async (
  dbId: number,
  userId: string
): Promise<PersistedCraftFairApplication | null> => {
  return getCraftApplicationByIdAndUserId(dbId, userId);
};

const createOrUpdateCraftApplication = async (
  craftApplication: CraftFairApplication,
  user: User
): Promise<PersistedCraftFairApplication> => {
  if (craftApplication.dbId) {
    const existingApplication = await getCraftApplication(
      craftApplication.dbId,
      user.userId
    );

    if (existingApplication) {
      const mergedApplication: PersistedCraftFairApplication = {
        ...existingApplication,
        ...craftApplication,
        userId: user.userId,
        contactFirstNames: user.firstName,
        contactLastName: user.lastName,
        email: user.email,
        totalCost: getTotalCraftFairApplicationCost(craftApplication),
      };

      return updateCraftApplicationListItem(mergedApplication);
    } else {
      throw new Error(
        "Cannot find existing application with dbId: " + craftApplication.dbId
      );
    }
  }
  return createCraftApplicationListItem({
    ...craftApplication,
    userId: user.userId,
    contactFirstNames: user.firstName,
    contactLastName: user.lastName,
    email: user.email,
    status: "Submitted",
    totalCost: getTotalCraftFairApplicationCost(craftApplication),
  });
};

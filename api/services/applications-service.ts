import { URL } from "url";
import {
  CraftFairApplication,
  PersistedCraftFairApplication,
} from "../interfaces/applications";
import { User } from "../interfaces/user";
import { getTotalCraftFairApplicationCost } from "./applications-pricing";
import {
  createCraftApplicationListItem,
  deleteCraftApplicationListItem,
  getCraftApplicationByIdAndUserId,
  getCraftApplicationsByUserId,
  updateCraftApplicationListItem,
} from "./applications-sp";
import { createDepositOrder } from "./applications-woocommerce";
import { getVendorPortalConfig } from "./configuration-service";

const config = getVendorPortalConfig();

export type ApplicationServiceErrorCode =
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_CONFLICT"
  | "APPLICATION_NOT_PAYABLE";

export type ApplicationServiceError<T extends ApplicationServiceErrorCode> = {
  code: T;
  message: string;
};

type OrError<T, U extends ApplicationServiceErrorCode> = readonly [
  ApplicationServiceError<U> | null,
  T | null
];

function success<T>(result: T): readonly [null, T] {
  return [null, result];
}

function fail<T extends ApplicationServiceErrorCode>(
  code: T,
  message?: string
): readonly [ApplicationServiceError<T>, null] {
  return [createError(code, message), null];
}

function createError<T extends ApplicationServiceErrorCode>(
  code: T,
  message?: string
): ApplicationServiceError<T> {
  return {
    code,
    message: message ?? "",
  };
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
  return progressApplication(createdOrUpdatedApplication);
};

export const deleteApplication = async (
  dbId: number,
  user: User
): Promise<OrError<null, "APPLICATION_NOT_FOUND" | "APPLICATION_CONFLICT">> => {
  const application = await getCraftApplication(dbId, user.userId);

  if (application) {
    // Applications can only be deleted if the deposit has not yet been paid.
    if (
      application.status === "Submitted" ||
      application.status === "Pending Deposit"
    ) {
      await deleteCraftApplicationListItem(application);
      return success(null);
    } else {
      return fail(
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
      return fail(
        "APPLICATION_NOT_PAYABLE",
        "No payment currently required for application."
      );
    }
  } else {
    return fail("APPLICATION_NOT_FOUND");
  }
};

const progressApplication = async (
  application: PersistedCraftFairApplication
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

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
  addFileToApplication,
  createCraftApplicationListItem,
  deleteCraftApplicationListItem,
  getCraftApplicationById,
  getCraftApplicationByIdAndUserId,
  getCraftApplicationsByUserId,
  updateCraftApplicationListItem,
} from "./applications-sp";
import { deleteDepositOrder } from "./applications-woocommerce";
import {
  progressApplication,
  transitionToStatus,
} from "./applications-workflow";
import { getVendorPortalConfig } from "./configuration-service";

const config = getVendorPortalConfig();

export type ApplicationServiceErrorCode =
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_CONFLICT"
  | "APPLICATION_NOT_PAYABLE";

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

export const applicationComplete = async (
  dbId: number,
  user: User
): Promise<
  OrError<
    PersistedCraftFairApplication,
    "APPLICATION_NOT_FOUND" | "APPLICATION_CONFLICT"
  >
> => {
  const application = await getCraftApplication(dbId, user.userId);

  if (application) {
    // Applications can only be marked as completed if currently pending uploading of documents.
    if (application.status === "Pending Document Upload") {
      const updatedApplication = await transitionToStatus(
        application,
        {},
        "Processing"
      );
      return success(updatedApplication);
    } else {
      return error(
        "APPLICATION_CONFLICT",
        "Cannot complete applications which are have status other than 'Pending Document Upload'"
      );
    }
  } else {
    return error("APPLICATION_NOT_FOUND");
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

type FileDetails = {
  filename: string;
  bufferFile: Buffer;
};

export const uploadFiles = async (
  id: number,
  user: User,
  files: FileDetails[]
) => {
  const application = await getCraftApplicationByIdAndUserId(id, user.userId);
  if (application) {
    for (const { filename, bufferFile } of files) {
      await addFileToApplication(application, filename, bufferFile);
    }
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

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

const ApplicationServiceErrorRuntimeType = "APPLICATION_SERVICE_ERROR";
export type ApplicationServiceErrorCode =
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_CONFLICT";

export type ApplicationServiceError<T extends ApplicationServiceErrorCode> = {
  runtimeType: typeof ApplicationServiceErrorRuntimeType;
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
    runtimeType: ApplicationServiceErrorRuntimeType,
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
  return createOrUpdateCraftApplication(application, user);
};

export const deleteApplication = async (
  dbId: number,
  user: User
): Promise<OrError<null, "APPLICATION_NOT_FOUND" | "APPLICATION_CONFLICT">> => {
  const application = await getCraftApplication(dbId, user.userId);

  if (application) {
    // Applications can only be deleted if the deposit has not yet been paid.
    if (application.status === "Pending Deposit") {
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

const getCraftApplication = async (
  dbId: number,
  userId: string
): Promise<PersistedCraftFairApplication | null> => {
  return getCraftApplicationByIdAndUserId(dbId, userId);
};

const createOrUpdateCraftApplication = async (
  craftApplication: CraftFairApplication,
  user: User
): Promise<CraftFairApplication> => {
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
        status: "Pending Deposit",
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
    status: "Pending Deposit",
    totalCost: getTotalCraftFairApplicationCost(craftApplication),
  });
};

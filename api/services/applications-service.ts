import {
  CraftFairApplication,
  CraftFairApplicationWithContact,
  PersistableCraftFairApplication,
  PersistedCraftFairApplication,
} from "../interfaces/applications";
import { User } from "../interfaces/user";
import { getTotalCraftFairApplicationCost } from "./applications-pricing";
import {
  createCraftApplicationListItem,
  getCraftApplicationByIdAndUserId,
  getCraftApplicationsByUserId,
  updateCraftApplicationListItem,
} from "./applications-sp";

const ApplicationServiceErrorRuntimeType = "APPLICATION_SERVICE_ERROR";
export type ApplicationServiceErrorCode = "APPLICATION_NOT_FOUND";

export type ApplicationServiceError<T extends ApplicationServiceErrorCode> = {
  runtimeType: typeof ApplicationServiceErrorRuntimeType;
  code: T;
  message: string;
};

function createError<T extends ApplicationServiceErrorCode>(
  code: T
): ApplicationServiceError<T> {
  return {
    runtimeType: ApplicationServiceErrorRuntimeType,
    code,
    message: "",
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
): Promise<void | ApplicationServiceError<"APPLICATION_NOT_FOUND">> => {
  const application = await getCraftApplication(dbId, user.userId);

  if (application) {
  } else {
    return createError("APPLICATION_NOT_FOUND");
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

import {
  ApplicationStatus,
  PersistedCraftFairApplication,
} from "../interfaces/applications";
import { PersistedOrder } from "../interfaces/woocommerce";
import {
  ensureDocumentFolderForApplication,
  updateCraftApplicationListItem,
} from "./applications-sp";
import {
  createDepositOrder,
  getDepositOrder,
} from "./applications-woocommerce";

interface ProgressApplicationContext {
  depositOrder?: PersistedOrder;
}

const progressApplicationForStatusSubmitted = async (
  application: PersistedCraftFairApplication,
  context: ProgressApplicationContext
): Promise<PersistedCraftFairApplication> => {
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

  if (persistedOrder) {
    application.depositOrderNumber = persistedOrder?.number;
    application.depositOrderKey = persistedOrder?.order_key;

    if (persistedOrder?.total) {
      application.depositAmount = parseFloat(persistedOrder?.total);
    }
    application.status = "Pending Deposit";
    return updateCraftApplicationListItem(application);
  } else {
    return application;
  }
};

const progressApplicationForStatusPendingDeposit = async (
  application: PersistedCraftFairApplication,
  context: ProgressApplicationContext
): Promise<PersistedCraftFairApplication> => {
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
    let updateRequired = false;

    // If values on the order have changed then we will need to update the application.
    const orderDepositTotal = parseFloat(depositOrder.total);
    const applicationDepositTotal = application.depositAmount;
    if (orderDepositTotal !== applicationDepositTotal) {
      application.depositAmount = orderDepositTotal;
      updateRequired = true;
    }

    if (depositOrder.status === "completed") {
      // Deposit has been paid, therefore advance status of application.
      // Function transitionToStatus will also persist changes to the application if the transition is successful,
      // meaning we can return here.
      application.depositAmountPaid = orderDepositTotal;
      return transitionToStatus(
        application,
        context,
        "Pending Document Upload"
      );
    }

    if (updateRequired) {
      return updateCraftApplicationListItem(application);
    }
  }

  return application;
};

const transitionToStatus = async (
  application: PersistedCraftFairApplication,
  context: ProgressApplicationContext,
  toStatus: ApplicationStatus
): Promise<PersistedCraftFairApplication> => {
  switch (toStatus) {
    case "Submitted":
      break;

    case "Pending Deposit":
      break;

    case "Pending Document Upload":
      application.documentFolder = await ensureDocumentFolderForApplication(
        application
      );
      application.status = "Pending Document Upload";
      return updateCraftApplicationListItem(application);
  }
  return application;
};

export const progressApplication = async (
  application: PersistedCraftFairApplication,
  context: ProgressApplicationContext
): Promise<PersistedCraftFairApplication> => {
  switch (application.status) {
    case "Submitted":
      return progressApplicationForStatusSubmitted(application, context);

    case "Pending Deposit":
      return progressApplicationForStatusPendingDeposit(application, context);

    default:
      return application;
  }
};

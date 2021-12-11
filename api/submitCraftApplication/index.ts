import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ValidationError } from "runtypes";

import { sanitiseCraftApplicationFromApiClient } from "../services/applications-sanitise";
import { submitCraftFairApplication } from "../services/applications-service";
import { getUserFromCookie } from "../services/users-cookie";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Only authenticated users should call this function.
  const user = getUserFromCookie(req.headers.cookie);

  if (!user) {
    context.res = {
      status: 401,
      body: "User must be signed in before submitting applications.",
    };
  } else {
    try {
      const application = sanitiseCraftApplicationFromApiClient(
        JSON.parse(req.body)
      );

      const persistedApplication = await submitCraftFairApplication(
        application,
        user
      );

      context.res = {
        status: 200,
        body: JSON.stringify(persistedApplication),
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    } catch (err) {
      if (err?.name === "ValidationError") {
        const validationError = err as ValidationError;
        if (err?.code === "CONTENT_INCORRECT") {
          context.res = {
            status: 400,
            body: JSON.stringify(validationError.details),
            headers: {
              "Content-Type": "application/json",
            },
          };
          return;
        }
      }
      console.error(err);
      throw err;
    }
  }
};

export default httpTrigger;

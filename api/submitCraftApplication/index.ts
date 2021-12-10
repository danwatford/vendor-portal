import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserFromCookie } from "../services/user";

import { CraftFairApplication } from "../interface/Applications";
import { createOrUpdateCraftApplication } from "../services/applications";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Only authenticated users should call this function.
  const user = await getUserFromCookie(req.headers.cookie);

  if (!user) {
    context.res = {
      status: 401,
      body: "User must be signed in before submitting applications.",
    };
  } else {
    const application: CraftFairApplication = JSON.parse(req.body);

    const persistedApplication = await createOrUpdateCraftApplication(
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
  }
};

export default httpTrigger;

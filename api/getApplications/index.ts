import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getCraftApplicationsForUser } from "../services/applications";
import { getUserFromCookie } from "../services/user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Only authenticated users should call this function.
  const user = await getUserFromCookie(req.headers.cookie);

  if (!user) {
    context.res = {
      status: 401,
      body: "User must be signed in before getting applications.",
    };
  } else {
    const applications = await getCraftApplicationsForUser(user.userId);

    context.res = {
      status: 200,
      body: applications,
      headers: { "Content-Type": "application/json" },
    };
  }
};

export default httpTrigger;

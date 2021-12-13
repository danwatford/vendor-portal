import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserFromCookie } from "../services/users-cookie";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const user = await getUserFromCookie(req.headers.cookie);

  if (user) {
    context.res = {
      status: 200,
      body: user,
      headers: { "Content-Type": "application/json" },
    };
  } else {
    context.res = {
      status: 401,
      body: "User must be signed in before retrieving their profile.",
    };
  }
};

export default httpTrigger;

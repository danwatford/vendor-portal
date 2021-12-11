import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserFromCookie } from "../services/users-cookie";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const user = await getUserFromCookie(req.headers.cookie);

  context.res.body = user;
  context.res.type("application/json");
};

export default httpTrigger;

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getUserFromCookie } from "../services/user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const user = await getUserFromCookie(req.headers.cookie);

  context.res = {
    body: user,
  };
};

export default httpTrigger;

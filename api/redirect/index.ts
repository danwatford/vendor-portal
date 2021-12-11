import { AzureFunction, Context, Cookie, HttpRequest } from "@azure/functions";
import { redirectHandler } from "../services/auth-handler";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = await redirectHandler(context, req);
};

export default httpTrigger;

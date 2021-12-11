import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { loginHandler } from "../services/auth-handler";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = await loginHandler(context, req);
};

export default httpTrigger;

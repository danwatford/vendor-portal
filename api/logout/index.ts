import { AzureFunction, Context, Cookie, HttpRequest } from "@azure/functions";
import { b2cPolicies, getLogoutLocation } from "../common/auth";
import { createExpiredUserCookie } from "../services/user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const expiredUserCookie = createExpiredUserCookie();

  const cookies: Cookie[] = [expiredUserCookie];

  context.res = {
    status: 302,
    cookies,
    headers: {
      Location: getLogoutLocation(
        context,
        b2cPolicies.authorities.signUpSignIn.authority
      ),
    },
  };
};

export default httpTrigger;

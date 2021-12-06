import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { APP_STATES, b2cPolicies, getAuthCodeLocation } from "../common/auth";
import { getUserFromCookie } from "../services/user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // If the user can be identified from a cookie then there is no need to redirect to the identity provider.
  const user = await getUserFromCookie(req.headers.cookie);

  if (user) {
    context.res = {
      status: 302,
      headers: {
        Location: process.env.WEBAPP_URI,
      },
    };
  } else {
    const location = await getAuthCodeLocation(
      context,
      b2cPolicies.authorities.signUpSignIn.authority,
      [],
      APP_STATES.LOGIN
    );

    context.res = {
      status: 302,
      headers: {
        Location: location,
      },
    };
  }
};

export default httpTrigger;

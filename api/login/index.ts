import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { b2cPolicies, getAuthCodeLocation } from "../common/auth";
import { getUserFromCookie } from "../services/user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const thisFunctionsUrl = context.req.headers["x-ms-original-url"];
  const requestedPostLoginRedirectUrl = req.query.postLoginRedirectUrl;
  const referringUrl = req.headers.referer;

  let postLoginRedirectUrl: string;
  if (requestedPostLoginRedirectUrl) {
    // Build a URL from the requested post login redirect url, using this functinon's URL as the base. This
    // allows requests to use paths only rather than full URLs.
    postLoginRedirectUrl = new URL(
      requestedPostLoginRedirectUrl,
      thisFunctionsUrl
    ).href;
  } else if (referringUrl) {
    // If a post login redirect URL was not requested, return to the URL which triggered the login request.
    postLoginRedirectUrl = referringUrl;
  } else {
    // If no referring URL then redirect to the root of the web application after login.
    postLoginRedirectUrl = new URL("/", thisFunctionsUrl).href;
  }

  // If the user can be identified from a cookie then there is no need to redirect to the identity provider.
  const user = await getUserFromCookie(req.headers.cookie);

  if (user) {
    // User is already signed in. Redirect back to the application.
    context.res = {
      status: 302,
      headers: {
        Location: postLoginRedirectUrl,
      },
    };
  } else {
    // Determine the URL to redirect the user to as part of the authorisation code flow.
    const authCodeUrl = await getAuthCodeLocation(
      context,
      b2cPolicies.authorities.signUpSignIn.authority,
      [],
      {
        type: "login",
        postAuthRedirectUrl: postLoginRedirectUrl,
      }
    );

    context.res = {
      status: 302,
      headers: {
        Location: authCodeUrl,
      },
    };
  }
};

export default httpTrigger;

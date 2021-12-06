import { AzureFunction, Context, Cookie, HttpRequest } from "@azure/functions";
import { AuthorizationCodeRequest } from "@azure/msal-node";
import {
  APP_STATES,
  getConfidentialClientApplication,
  getConfidentialClientConfig,
} from "../common/auth";
import { createOrUpdateUser, createUserCookie } from "../services/user";
import { User } from "../interface/user";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const confidentialClientConfig = getConfidentialClientConfig(context);
  const cca = getConfidentialClientApplication(context);

  // determine where the request comes from
  if (req.query.state === APP_STATES.LOGIN) {
    // prepare the request for authentication
    const tokenRequest: AuthorizationCodeRequest = {
      scopes: ["openid", "offline_access"],
      code: req.query.code,
      redirectUri: confidentialClientConfig.auth.redirectUri,
    };

    const tokenResponse = await cca.acquireTokenByCode(tokenRequest);
    const idClaims = tokenResponse.idTokenClaims;
    const user: User = {
      userId: idClaims["sub"],
      identityProvider: idClaims["idp"] || "email",
      email: idClaims["emails"][0],
      displayName: idClaims["name"],
      firstName: idClaims["given_name"],
      lastName: idClaims["family_name"],
      dbId: null,
    };

    const persistedUser = await createOrUpdateUser(user);

    const userCookie = createUserCookie(persistedUser.userId, persistedUser);

    const cookies: Cookie[] = [userCookie];

    context.res = {
      status: 302,
      cookies,
      headers: {
        Location: process.env.WEBAPP_URI,
      },
    };
  }
};

export default httpTrigger;

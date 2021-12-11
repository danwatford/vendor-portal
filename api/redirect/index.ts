import { AzureFunction, Context, Cookie, HttpRequest } from "@azure/functions";
import { AuthorizationCodeRequest } from "@azure/msal-node";
import {
  getConfidentialClientApplication,
  getConfidentialClientConfig,
} from "../common/auth";
import { createOrUpdateUser } from "../services/users-service";
import { User } from "../interfaces/user";
import { decodeAuthState } from "../services/auth-state";
import { createUserCookie } from "../services/users-cookie";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const confidentialClientConfig = getConfidentialClientConfig(context);
  const cca = getConfidentialClientApplication(context);

  context.log("In redirect. Checking query state: " + req.query.state);

  const authState = decodeAuthState(req.query.state);

  // determine where the request comes from
  if (authState.type === "login") {
    context.log("In LOGIN state");
    // prepare the request for authentication
    const tokenRequest: AuthorizationCodeRequest = {
      scopes: ["openid", "offline_access"],
      code: req.query.authcode,
      redirectUri: confidentialClientConfig.auth.redirectUri,
    };

    context.log("About to request ID token by code");
    const tokenResponse = await cca.acquireTokenByCode(tokenRequest);
    context.log("Got token response: " + JSON.stringify(tokenResponse));
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

    context.log("About to create or update user: " + JSON.stringify(user));
    const persistedUser = await createOrUpdateUser(user);
    context.log("User saved. ID is " + persistedUser.dbId);

    const userCookie = createUserCookie(persistedUser.userId, persistedUser);

    const cookies: Cookie[] = [userCookie];

    context.res = {
      status: 302,
      cookies,
      headers: {
        Location: authState.postAuthRedirectUrl,
      },
    };
  }
};

export default httpTrigger;

import { URL } from "url";
import { Context, Cookie, HttpRequest } from "@azure/functions";
import * as msal from "@azure/msal-node";
import { AuthState, decodeAuthState, encodeAuthState } from "./auth-state";
import {
  createInvalidUserCookie,
  createUserCookie,
  getUserFromCookie,
} from "./users-cookie";
import { User } from "../interfaces/user";
import { createOrUpdateUser } from "./users-service";

/**
 * The MSAL.js library allows you to pass your custom state as state parameter in the Request object
 * By default, MSAL.js passes a randomly generated unique state parameter value in the authentication requests.
 * The state parameter can also be used to encode information of the app's state before redirect.
 * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
 * For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/msal-js-pass-custom-state-authentication-request
 */
export const APP_STATES = {
  LOGIN: "login",
  CALL_API: "call_api",
  PASSWORD_RESET: "password_reset",
};

export const b2cPolicies = {
  names: {
    signUpSignIn: "B2C_1_SignUpSignIn",
    resetPassword: "B2C_1_reset",
    editProfile: "B2C_1_edit_profile",
  },
  authorities: {
    signUpSignIn: {
      authority:
        "https://bfwextapps.b2clogin.com/bfwextapps.onmicrosoft.com/B2C_1_SignUpSignIn",
    },
    resetPassword: {
      authority:
        "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_reset",
    },
    editProfile: {
      authority:
        "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_edit_profile",
    },
  },
  authorityDomain: "bfwextapps.b2clogin.com",
};

/**
 * HTTP response object. Provided to your function when using HTTP Bindings.
 */
export type HttpResponseContextObject = {
  [key: string]: any;
};

export const loginHandler = async (
  context: Context,
  req: HttpRequest
): Promise<HttpResponseContextObject> => {
  const postLoginRedirectUrl = getPostLoginUrl(req);

  // If the user can be identified from a cookie then there is no need to redirect to the identity provider.
  const user = getUserFromCookie(req.headers.cookie);

  if (user) {
    // User is already signed in. Redirect back to the application.
    return {
      status: 302,
      headers: {
        Location: postLoginRedirectUrl,
      },
    };
  } else {
    // Determine the URL to redirect the user to as part of the authorisation code flow.
    const authCodeUrl = await getAuthCodeUrl(
      context,
      b2cPolicies.authorities.signUpSignIn.authority,
      [],
      {
        type: "login",
        postAuthRedirectUrl: postLoginRedirectUrl,
      },
      getAuthCodeRedirectUrl(req)
    );

    return {
      status: 302,
      headers: {
        Location: authCodeUrl,
      },
    };
  }
};

export const redirectHandler = async (
  context: Context,
  req: HttpRequest
): Promise<HttpResponseContextObject> => {
  const cca = getConfidentialClientApplication(context);

  if (req.query.state) {
    const authState = decodeAuthState(req.query.state);

    // determine where the request comes from
    if (authState && authState.type === "login" && req.query.authcode) {
      context.log("In LOGIN state");
      // prepare the request for authentication
      const tokenRequest: msal.AuthorizationCodeRequest = {
        scopes: ["openid", "offline_access"],
        code: req.query.authcode,
        redirectUri: getAuthCodeRedirectUrl(req),
      };

      context.log("About to request ID token by code");
      const tokenResponse = await cca.acquireTokenByCode(tokenRequest);
      context.log("Got token response: " + JSON.stringify(tokenResponse));
      if (tokenResponse) {
        const idClaims = tokenResponse.idTokenClaims;
        const user: User = {
          userId: idClaims["sub"],
          identityProvider: idClaims["idp"] || "email",
          email: idClaims["emails"][0],
          displayName: idClaims["name"],
          firstName: idClaims["given_name"],
          lastName: idClaims["family_name"],
        };

        const persistedUser = await createOrUpdateUser(user);
        const userCookie = createUserCookie(
          persistedUser.userId,
          persistedUser
        );
        const cookies: Cookie[] = [userCookie];

        return {
          status: 302,
          cookies,
          headers: {
            Location: authState.postAuthRedirectUrl,
          },
        };
      }
    }
  }

  return {
    status: 400,
  };
};

export const logoutHandler = (req: HttpRequest): HttpResponseContextObject => {
  const expiredUserCookie = createInvalidUserCookie();
  const cookies: Cookie[] = [expiredUserCookie];

  return {
    status: 302,
    cookies,
    headers: {
      Location: getLogoutUrl(
        req,
        b2cPolicies.authorities.signUpSignIn.authority
      ),
    },
  };
};

const getPostLoginUrl = (req: HttpRequest): string => {
  const currentFunctionsUrl = req.headers["x-ms-original-url"];
  const requestedPostLoginRedirectUrl = req.query.postLoginRedirectUrl;
  const referringUrl = req.headers.referer;

  if (requestedPostLoginRedirectUrl) {
    // Build a URL from the requested post login redirect url, using this functinon's URL as the base. This
    // allows requests to use paths only rather than full URLs.
    return new URL(requestedPostLoginRedirectUrl, currentFunctionsUrl).href;
  } else if (referringUrl) {
    // If a post login redirect URL was not requested, return to the URL which triggered the login request.
    return referringUrl;
  } else {
    // If no referring URL then redirect to the root of the web application after login.
    return new URL("/", currentFunctionsUrl).href;
  }
};

const getAuthCodeRedirectUrl = (req: HttpRequest): string => {
  const currentFunctionsUrl = req.headers["x-ms-original-url"];
  return new URL("/api/redirect", currentFunctionsUrl).href;
};

const getPostLogoutUrl = (req: HttpRequest): string => {
  const currentFunctionsUrl = req.headers["x-ms-original-url"];
  return new URL("/", currentFunctionsUrl).href;
};

const getConfidentialClientConfig = (context: Context) => {
  return {
    auth: {
      clientId: process.env.B2C_CLIENT_ID!,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      clientSecret: process.env.B2C_CLIENT_SECRET!,
      knownAuthorities: [b2cPolicies.authorityDomain],
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel, message, containsPii) {
          context.log(message);
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Verbose,
      },
    },
  };
};

const getAuthCodeUrl = async (
  context: Context,
  authority: string,
  scopes: string[],
  state: AuthState,
  redirectUri: string
): Promise<string> => {
  const cca = getConfidentialClientApplication(context);

  /**
   * Request Configuration
   * We manipulate these two request objects below
   * to acquire a token with the appropriate claims.
   */
  const authCodeRequest = {
    redirectUri,
    authority,
    scopes,
    state: encodeAuthState(state),
  };

  // request an authorization code to exchange for a token
  return cca.getAuthCodeUrl(authCodeRequest);
};

const getLogoutUrl = (req: HttpRequest, authority: string) => {
  const logoutUrl = new URL(authority + "/oauth2/v2.0/logout");
  logoutUrl.searchParams.append("redirect_uri", getPostLogoutUrl(req));

  return logoutUrl.href;
};

export const getConfidentialClientApplication = (context: Context) => {
  const confidentialClientConfig = getConfidentialClientConfig(context);
  return new msal.ConfidentialClientApplication(confidentialClientConfig);
};

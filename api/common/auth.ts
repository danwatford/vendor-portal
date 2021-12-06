import { URL } from "url";
import { Context } from "@azure/functions";
import * as msal from "@azure/msal-node";

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

export const getConfidentialClientConfig = (context: Context) => {
  context.log("Getting confidential client. Request is:", context.req);
  return {
    auth: {
      clientId: process.env.B2C_CLIENT_ID,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      clientSecret: process.env.B2C_CLIENT_SECRET,
      knownAuthorities: [b2cPolicies.authorityDomain],
      redirectUri: new URL("redirect", context.req.headers["x-ms-original-url"])
        .href,
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

/**
 * This method is used to generate an auth code request
 * @param {string} authority: the authority to request the auth code from
 * @param {array} scopes: scopes to request the auth code for
 * @param {string} state: state of the application
 * @param {Object} res: express middleware response object
 */
export const getAuthCodeLocation = async (
  context: Context,
  authority: string,
  scopes: string[],
  state: string
): Promise<string> => {
  const confidentialClientConfig = getConfidentialClientConfig(context);
  const cca = getConfidentialClientApplication(context);

  /**
   * Request Configuration
   * We manipulate these two request objects below
   * to acquire a token with the appropriate claims.
   */
  const authCodeRequest = {
    redirectUri: confidentialClientConfig.auth.redirectUri,
    authority,
    scopes,
    state,
  };

  // request an authorization code to exchange for a token
  return cca.getAuthCodeUrl(authCodeRequest);
};

export const getConfidentialClientApplication = (context: Context) => {
  const confidentialClientConfig = getConfidentialClientConfig(context);
  return new msal.ConfidentialClientApplication(confidentialClientConfig);
};

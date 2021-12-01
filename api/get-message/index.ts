import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import {
  getUserInfo,
  isAuthenticated,
} from "@aaronpowell/static-web-apps-api-auth";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");
  const name = req.query.name || (req.body && req.body.name);
  let responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

  if (isAuthenticated(req)) {
    const userInfo = getUserInfo(req);

    const additionalResponseMessage = `You have signed in with ${userInfo.identityProvider}. Your user id is ${userInfo.userId}. Details: ${userInfo.userDetails}`;
    responseMessage = responseMessage + " " + additionalResponseMessage;
  } else {
    responseMessage = responseMessage + " Not authenticated";
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};

export default httpTrigger;

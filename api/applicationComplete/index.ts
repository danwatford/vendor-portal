import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { applicationComplete } from "../services/applications-service";
import { getUserFromCookie } from "../services/users-cookie";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Only authenticated users should call this function.
  const user = getUserFromCookie(req.headers.cookie);

  if (!user) {
    context.res = {
      status: 401,
      body: "User must be signed in before getting applications.",
    };
  } else {
    const dbIdParam = req.query.dbId;
    if (!dbIdParam) {
      context.res = {
        status: 400,
        body: "Missing query argument: dbId",
      };
    } else {
      const dbId = parseInt(dbIdParam);
      if (isNaN(dbId)) {
        context.res = {
          status: 400,
          body: "Query argument must be a number: dbId",
        };
      } else {
        const [error, persistedApplication] = await applicationComplete(
          dbId,
          user
        );
        if (error) {
          switch (error.code) {
            case "APPLICATION_NOT_FOUND":
              context.res = {
                status: 404,
                body: "Application not found",
              };
              break;

            case "APPLICATION_CONFLICT":
              context.res = {
                status: 409,
                body: error.message,
              };
              break;

            default:
              const _exhaustiveCheck: never = error.code;
              return _exhaustiveCheck;
          }
        } else {
          context.res = {
            status: 200,
            body: JSON.stringify(persistedApplication),
            headers: {
              "Content-Type": "application/json",
            },
          };
        }
      }
    }
  }
};

export default httpTrigger;

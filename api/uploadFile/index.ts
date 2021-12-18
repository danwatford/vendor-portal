import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import parseMultipartFormData from "@anzp/azure-function-multipart";

import { getUserFromCookie } from "../services/users-cookie";
import { uploadFiles } from "../services/applications-service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Only authenticated users should call this function.
  const user = getUserFromCookie(req.headers.cookie);

  if (!user) {
    context.res = {
      status: 401,
      body: "User must be signed in before uploading files.",
    };
  } else if (req.method !== "POST") {
    context.res = {
      status: 405,
      body: "Only POST methods permitted for uploading files.",
    };
  } else {
    const { fields, files } = await parseMultipartFormData(req);

    const dbIdParsedField = fields.find(
      (parsedField) => parsedField.fieldname === "dbId"
    );
    if (!dbIdParsedField) {
      context.res = {
        status: 400,
        body: "Missing dbId field",
      };
    } else {
      await uploadFiles(parseInt(dbIdParsedField.value), user, files);
      context.res = {
        status: 200,
      };
    }
  }
};

export default httpTrigger;

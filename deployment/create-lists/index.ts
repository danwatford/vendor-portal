import "dotenv/config";
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";

import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import { List } from "@microsoft/microsoft-graph-types";

import validateEnv from "./utils/validateEnv";
import lists from "./list-info";

validateEnv();

const credential = new ClientSecretCredential(
  process.env["TENANT_ID"],
  process.env["CLIENT_ID"],
  process.env["CLIENT_SECRET"]
);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const client = Client.initWithMiddleware({
  debugLogging: false,
  authProvider,
});

async function createList(applicationsList: List) {
  try {
    const siteRequest = await client
      .api(
        `/sites/${process.env["TENANT_NAME"]}.sharepoint.com:${process.env["SITE_PATH"]}`
      )
      .get();
    const siteBaseApi: string = "sites/" + siteRequest.id;

    try {
      const existingList = await client
        .api(
          siteBaseApi +
            "/lists/" +
            applicationsList.displayName +
            "?expand=columns(select=id,name)"
        )
        .get();

      const listBaseApi: string = siteBaseApi + "/lists/" + existingList.id;
      const existingColumns: List["columns"] = existingList.columns;
      for (const fieldDef of applicationsList.columns) {
        const existingColumn = existingColumns.find(
          (existingColumn) => existingColumn.name === fieldDef.name
        );
        if (existingColumn) {
          const updateColumnResult = await client
            .api(listBaseApi + "/columns/" + existingColumn.id)
            .patch(fieldDef);
          console.log(updateColumnResult);
        } else {
          const createColumnResult = await client
            .api(listBaseApi + "/columns")
            .post(fieldDef);
          console.log(createColumnResult);
        }
      }
    } catch (existingListErr) {
      if (
        existingListErr.statusCode === 404 &&
        existingListErr.code === "itemNotFound"
      ) {
        await client.api(siteBaseApi + "/lists").post(applicationsList);
      } else {
        console.log(existingListErr);
        throw existingListErr;
      }
    }
  } catch (err) {
    console.error(JSON.stringify(err));
  }
}

async function createLists() {
  for (const list of lists) {
    await createList(list);
  }
}

createLists();

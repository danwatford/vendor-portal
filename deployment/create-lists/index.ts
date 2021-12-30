import "dotenv/config";
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ColumnDefinition, List } from "@microsoft/microsoft-graph-types";

import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";

import validateEnv from "./utils/validateEnv";

validateEnv();

const applicationColumns: ColumnDefinition[] = [
  {
    name: "Status",
    indexed: true,
    required: true,
    choice: {
      allowTextEntry: false,
      displayAs: "dropDownMenu",
      choices: [
        "Submitted",
        "Pending Deposit",
        "Pending Document Upload",
        "Processing",
        "Rejected",
        "Accepted Pending Payment",
        "Accepted",
      ],
    },
    defaultValue: {
      value: "Submitted",
    },
  },
  {
    name: "TotalCost",
    displayName: "Total cost",
    indexed: true,
    required: true,
    currency: {
      locale: "en-gb",
    },
  },
  {
    name: "DescriptionOfStall",
    displayName: "Description of stall",
    text: {
      allowMultipleLines: true,
      linesForEditing: 3,
    },
  },
  {
    name: "AddressLine1",
    displayName: "Address line 1",
    text: {},
  },
  {
    name: "AddressLine2",
    displayName: "Address line 2",
    text: {},
  },
  {
    name: "City",
    text: {},
  },
  {
    name: "State",
    text: {},
  },
  {
    name: "Postcode",
    text: {},
  },
  {
    name: "Country",
    text: {},
  },
  {
    name: "ContactFirstName",
    displayName: "Contact first name",
    text: {},
  },
  {
    name: "ContactLastName",
    displayName: "Contact last name",
    text: {},
  },
];

const applicationsList: List = {
  displayName: "Applications",
  description: "List of applications for catering and craft fair pitches",
  columns: applicationColumns,
};

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

async function createList() {
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
      const existingColumns: ColumnDefinition[] = existingList.columns;
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

createList();

import { ColumnDefinition, List } from "@microsoft/microsoft-graph-types";

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

const allLists: List[] = [applicationsList];

export default allLists;

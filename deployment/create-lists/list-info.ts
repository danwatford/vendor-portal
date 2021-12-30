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
  {
    name: "ContactEmail",
    displayName: "Contact email",
    indexed: true,
    required: true,
    text: {},
  },
  {
    name: "Landline",
    text: {},
  },
  {
    name: "Mobile",
    text: {},
  },
  {
    name: "Website",
    hyperlinkOrPicture: { isPicture: false },
  },
  { name: "UserId", indexed: true, required: true, text: {} },
  {
    name: "PitchType",
    displayName: "Pitch type",
    indexed: true,
    required: true,
    choice: {
      allowTextEntry: false,
      choices: [
        "standardNoShelter",
        "extraLargeNoShelter",
        "standardInMarquee",
        "doubleInMarquee",
      ],
    },
  },
  {
    name: "PitchAdditionalWidth",
    displayName: "Pitch additional width",
    number: {},
  },
  {
    name: "PitchVanSpaceRequired",
    displayName: "Pitch van space required",
    indexed: true,
    boolean: {},
    defaultValue: { value: "No" },
  },
  {
    name: "PitchElectricalOptions",
    displayName: "Pitch electrical options",
    indexed: true,
    choice: {
      allowTextEntry: false,
      choices: [
        "none",
        "1 x 13amp socket",
        "1 x 16amp socket",
        "2 x 13amp socket",
        "1 x 32amp supply",
      ],
    },
    defaultValue: { value: "none" },
  },
  {
    name: "CampingRequired",
    displayName: "Camping required",
    boolean: {},
    defaultValue: { value: "No" },
  },
  {
    name: "Tables",
    number: {},
  },
  {
    name: "DepositOrderNumber",
    displayName: "Deposit order number",
    indexed: true,
    number: {},
  },
  {
    name: "DepositOrderKey",
    displayName: "Deposit order key",
    indexed: true,
    text: {},
  },
  {
    name: "DepositAmount",
    displayName: "Deposit amount",
    currency: {
      locale: "en-gb",
    },
  },
  {
    name: "DepositAmountPaid",
    displayName: "Deposit Amount Paid",
    currency: {
      locale: "en-gb",
    },
  },
  {
    name: "Total Paid",
    displayName: "Total Paid",
    currency: {
      locale: "en-gb",
    },
  },
  {
    name: "DocumentFolder",
    displayName: "Document Folder",
    hyperlinkOrPicture: { isPicture: false },
  },
];

const applicationsList: List = {
  displayName: "Applications",
  description: "List of applications for catering and craft fair pitches",
  columns: applicationColumns,
};

const allLists: List[] = [applicationsList];

export default allLists;

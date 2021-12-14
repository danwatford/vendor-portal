import {
  Boolean,
  Number,
  String,
  Literal,
  Record,
  Union,
  Static,
  Optional,
  Array,
} from "runtypes";

export const ApplicationStatusRunType = Union(
  Literal("Pending Deposit"),
  Literal("Pending Document Upload"),
  Literal("Processing"),
  Literal("Rejected"),
  Literal("Accepted Pending Payment"),
  Literal("Accepted")
);

export const PitchTypeRunType = Union(
  Literal("standardNoShelter"),
  Literal("extraLargeNoShelter"),
  Literal("standardInMarquee"),
  Literal("doubleInMarquee")
);

export const ElectricalOptionRunType = Union(
  Literal("none"),
  Literal("1 x 13amp socket"),
  Literal("1 x 16amp socket"),
  Literal("2 x 13amp socket"),
  Literal("1 x 32amp supply")
);

export const VendorContactRunType = Record({
  userId: String,
  contactFirstNames: String,
  contactLastName: String,
  email: String,
});

export const CraftFairApplicationRunType = Record({
  tradingName: String,
  addressLine1: String,
  addressLine2: Optional(String),
  city: String,
  state: String,
  postcode: String,
  country: String,
  landline: Optional(String),
  mobile: Optional(String),
  website: Optional(String),
  descriptionOfStall: String,
  pitchType: PitchTypeRunType,
  pitchAdditionalWidth: Number,
  pitchVanSpaceRequired: Boolean,
  pitchElectricalOptions: ElectricalOptionRunType,
  campingRequired: Boolean,
  tables: Number,
  totalCost: Optional(Number),
});

export const DraftCraftFairApplicationRunType = CraftFairApplicationRunType.And(
  Record({
    draftId: Number,
    lastSaved: String,
  })
);

export const SubmittedCraftFairApplicationRunType =
  CraftFairApplicationRunType.And(
    Record({
      dbId: Number,
      status: ApplicationStatusRunType,
      userId: String,
      contactFirstNames: String,
      contactLastName: String,
      email: String,
      created: String,
    })
  );

export const SubmittedCraftFairApplicationListRunType = Array(
  SubmittedCraftFairApplicationRunType
);

export type PitchType = Static<typeof PitchTypeRunType>;
export type ElectricalOption = Static<typeof ElectricalOptionRunType>;
export type VendorContact = Static<typeof VendorContactRunType>;
export type ApplicationStatus = Static<typeof ApplicationStatusRunType>;

export type CraftFairApplication = Static<typeof CraftFairApplicationRunType>;
export type DraftCraftFairApplication = Static<
  typeof DraftCraftFairApplicationRunType
>;
export type SubmittedCraftFairApplication = Static<
  typeof SubmittedCraftFairApplicationRunType
>;

export const initialCraftFairApplication: CraftFairApplication = {
  tradingName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postcode: "",
  country: "United Kingdom",
  landline: "",
  mobile: "",
  website: "",
  descriptionOfStall: "",
  pitchType: "standardNoShelter",
  pitchAdditionalWidth: 0,
  pitchVanSpaceRequired: false,
  pitchElectricalOptions: "none",
  campingRequired: false,
  tables: 0,
  totalCost: 0,
};

export function isDraftCraftFairApplication(
  application: DraftCraftFairApplication | SubmittedCraftFairApplication
): application is DraftCraftFairApplication {
  return (application as DraftCraftFairApplication).draftId !== undefined;
}

export function isSubmittedCraftFairApplication(
  application: DraftCraftFairApplication | SubmittedCraftFairApplication
): application is SubmittedCraftFairApplication {
  return (application as SubmittedCraftFairApplication).dbId !== undefined;
}

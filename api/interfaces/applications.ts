import {
  Boolean,
  Number,
  String,
  Literal,
  Record,
  Union,
  Static,
  Optional,
} from "runtypes";

export const ApplicationStatusRunType = Union(
  Literal("Submitted"),
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
  dbId: Optional(Number),
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

export const PersistableCraftFairApplicationRunType =
  CraftFairApplicationRunType.And(
    Record({
      email: String,
      userId: String,
      contactFirstNames: String,
      contactLastName: String,
      status: ApplicationStatusRunType,
      totalCost: Number,
      depositOrderNumber: Optional(Number),
      depositOrderKey: Optional(String),
    })
  );

export const PersistedCraftFairApplicationRunType =
  PersistableCraftFairApplicationRunType.And(
    Record({
      dbId: Number,
      created: String,
    })
  );

export type PitchType = Static<typeof PitchTypeRunType>;
export type ElectricalOption = Static<typeof ElectricalOptionRunType>;
export type VendorContact = Static<typeof VendorContactRunType>;
export type CraftFairApplication = Static<typeof CraftFairApplicationRunType>;
export type PersistableCraftFairApplication = Static<
  typeof PersistableCraftFairApplicationRunType
>;
export type PersistedCraftFairApplication = Static<
  typeof PersistedCraftFairApplicationRunType
>;
export type ApplicationStatus = Static<typeof ApplicationStatusRunType>;

export type CraftFairApplicationWithContact = VendorContact &
  CraftFairApplication;

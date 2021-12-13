export type PitchType =
  | "standardNoShelter"
  | "extraLargeNoShelter"
  | "standardInMarquee"
  | "doubleInMarquee";

export type ElectricalOption =
  | "none"
  | "1 x 13amp socket"
  | "1 x 16amp socket"
  | "2 x 13amp socket"
  | "1 x 32amp supply";

export type VendorContact = {
  contactFirstNames: string;
  contactLastName: string;
  email: string;
};

export type CraftFairApplication = {
  tradingName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  landline: string;
  mobile: string;
  descriptionOfStall: string;
  pitchType: PitchType;
  pitchAdditionalWidth: number;
  pitchVanSpaceRequired: boolean;
  pitchElectricalOptions: ElectricalOption;
  campingRequired: boolean;
  tables: number;
  totalCost: number;
  dbId?: number;
  created?: string;
};

export type LocalCraftFairApplication = CraftFairApplication & {
  draftId: number;
  lastSaved?: string;
};

export type CraftFairApplicationWithContact = VendorContact &
  CraftFairApplication;

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
  descriptionOfStall: "",
  pitchType: "standardNoShelter",
  pitchAdditionalWidth: 0,
  pitchVanSpaceRequired: false,
  pitchElectricalOptions: "none",
  campingRequired: false,
  tables: 0,
  totalCost: 0,
};

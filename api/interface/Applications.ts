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
  userId: string;
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
  pitchElectricity: ElectricalOption;
  campingRequired: boolean;
  tables: number;
  dbId?: number;
  created?: string;
};

export type CraftFairApplicationWithUserId = CraftFairApplication & {
  userId: string;
};

export type CraftFairApplicationWithContact = VendorContact &
  CraftFairApplication;

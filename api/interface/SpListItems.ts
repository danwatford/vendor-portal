export interface ListItem {
  ID?: number;
  Title: string;
  Created?: string;
}

export interface UserListItem extends ListItem {
  UserId: string;
  IdentityProvider: string;
  ContactFirstName: string;
  ContactLastName: string;
  ContactEmail: string;
}

export interface CraftFairApplicationListItem extends ListItem {
  Title: string;
  DescriptionOfStall: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  State: string;
  Postcode: string;
  Country: string;
  Landline: string;
  Mobile: string;
  ContactFirstName: string;
  ContactLastName: string;
  ContactEmail: string;
  // PitchType: string;
  // PitchAdditionalWidth: number;
  // PitchVanSpaceRequired: boolean;
  // PitchElectricity: string;
  // CampingRequired: boolean;
  // Tables: number;
  TotalCost: number;
  UserId: string;
}

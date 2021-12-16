export type ListItem = {
  Title: string;
};

export type PersistedListItem = ListItem & {
  ID: number;
  Created: string;
};

export type UserListItem = ListItem & {
  UserId: string;
  IdentityProvider: string;
  ContactFirstName: string;
  ContactLastName: string;
  ContactEmail: string;
};

export type PersistedUserListItem = UserListItem & PersistedListItem;

export type CraftFairApplicationListItem = ListItem & {
  Title: string;
  Status: string;
  DescriptionOfStall: string;
  AddressLine1: string;
  AddressLine2?: string;
  City: string;
  State: string;
  Postcode: string;
  Country: string;
  Landline?: string;
  Mobile?: string;
  Website?: string;
  ContactFirstName: string;
  ContactLastName: string;
  ContactEmail: string;
  PitchType: string;
  PitchAdditionalWidth: number;
  PitchVanSpaceRequired: boolean;
  PitchElectricalOptions: string;
  CampingRequired: boolean;
  Tables: number;
  TotalCost: number;
  UserId: string;
  DepositOrderNumber?: number;
  DepositOrderKey?: string;
  DepositAmount?: number;
  DepositAmountPaid?: number;
};

export type PersistedCraftFairApplicationListItem =
  CraftFairApplicationListItem & PersistedListItem;

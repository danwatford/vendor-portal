import {
  ApplicationStatus,
  ApplicationStatusRunType,
  CraftFairApplication,
  CraftFairApplicationWithContact,
  ElectricalOption,
  ElectricalOptionRunType,
  PitchType,
  PitchTypeRunType,
} from "../interfaces/applications";
import { CraftFairApplicationListItem } from "../interfaces/SpListItems";
import { applyToItemsByFilter, createItem, updateItem } from "./sp";

const vendorSiteUrl: string = process.env.VENDORS_SITE;
const vendorCraftApplicationsListGuid: string =
  process.env.VENDORS_CRAFT_APPLICATIONS_LIST_GUID;

export const getCraftApplicationByIdAndUserId = async (
  id: number,
  userId: string
) => {
  const applications = await getCraftApplicationsByFilter(
    `ID eq '${id}' and UserId eq '${userId}'`
  );
  if (applications?.length) {
    return applications[0];
  } else {
    return null;
  }
};

export const getCraftApplicationsByUserId = async (
  userId: string
): Promise<CraftFairApplication[]> => {
  return getCraftApplicationsByFilter(`UserId eq '${userId}'`);
};

const getCraftApplicationsByFilter = async (
  filter?: string
): Promise<CraftFairApplication[]> => {
  return applyToItemsByFilter<
    CraftFairApplicationListItem,
    CraftFairApplication[]
  >(
    vendorSiteUrl,
    vendorCraftApplicationsListGuid,
    (items: CraftFairApplicationListItem[]) => {
      return Promise.resolve(
        items.map((item) => listItemToCraftApplication(item))
      );
    },
    filter
  );
};
export const updateCraftApplicationListItem = async (
  application: CraftFairApplicationWithContact
): Promise<CraftFairApplication> => {
  const listItem = craftApplicationToListItem(application);
  await updateItem(vendorSiteUrl, vendorCraftApplicationsListGuid, listItem);
  return application;
};

export const createCraftApplicationListItem = async (
  application: CraftFairApplicationWithContact
): Promise<CraftFairApplicationWithContact> => {
  const addResult = await createItem<CraftFairApplicationListItem>(
    vendorSiteUrl,
    vendorCraftApplicationsListGuid,
    craftApplicationToListItem(application)
  );
  return listItemToCraftApplication(addResult.data);
};

const craftApplicationToListItem = (
  craftApplication: CraftFairApplication
): CraftFairApplicationListItem => {
  return {
    ID: craftApplication.dbId,
    Title: craftApplication.tradingName,
    Status: craftApplication.status,
    DescriptionOfStall: craftApplication.descriptionOfStall,
    AddressLine1: craftApplication.addressLine1,
    AddressLine2: craftApplication.addressLine2,
    City: craftApplication.city,
    State: craftApplication.state,
    Postcode: craftApplication.postcode,
    Country: craftApplication.country,
    ContactFirstName: craftApplication.contactFirstNames,
    ContactLastName: craftApplication.contactLastName,
    ContactEmail: craftApplication.email,
    Landline: craftApplication.landline,
    Mobile: craftApplication.mobile,
    UserId: craftApplication.userId,
    TotalCost: craftApplication.totalCost,
    PitchType: craftApplication.pitchType,
    PitchAdditionalWidth: craftApplication.pitchAdditionalWidth,
    PitchVanSpaceRequired: craftApplication.pitchVanSpaceRequired,
    PitchElectricalOptions: craftApplication.pitchElectricalOptions,
    CampingRequired: craftApplication.campingRequired,
    Tables: craftApplication.tables,
  };
};

const listItemToCraftApplication = (
  item: CraftFairApplicationListItem
): CraftFairApplicationWithContact => {
  const status: ApplicationStatus = ApplicationStatusRunType.guard(item.Status)
    ? item.Status
    : "Pending Deposit";
  const pitchType: PitchType = PitchTypeRunType.guard(item.PitchType)
    ? item.PitchType
    : "standardNoShelter";
  const pitchElectricalOptions: ElectricalOption =
    ElectricalOptionRunType.guard(item.PitchElectricalOptions)
      ? item.PitchElectricalOptions
      : "none";

  return {
    dbId: item.ID,
    userId: item.UserId,
    tradingName: item.Title,
    status,
    addressLine1: item.AddressLine1,
    addressLine2: item.AddressLine2 || "",
    city: item.City,
    state: item.State,
    postcode: item.Postcode,
    country: item.Country,
    contactFirstNames: item.ContactFirstName,
    contactLastName: item.ContactLastName,
    email: item.ContactEmail,
    landline: item.Landline || "",
    mobile: item.Mobile || "",
    descriptionOfStall: item.DescriptionOfStall,
    pitchType,
    pitchAdditionalWidth: item.PitchAdditionalWidth,
    pitchVanSpaceRequired: item.PitchVanSpaceRequired,
    pitchElectricalOptions,
    campingRequired: item.CampingRequired,
    totalCost: item.TotalCost,
    tables: item.Tables,
    created: item.Created,
  };
};

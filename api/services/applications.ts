import {
  CraftFairApplication,
  CraftFairApplicationWithContact,
  CraftFairApplicationWithUserId,
} from "../interface/Applications";
import { CraftFairApplicationListItem } from "../interface/SpListItems";
import { User } from "../interface/user";
import { applyToItemsByFilter, createItem, updateItem } from "./Sp";

const vendorSiteUrl: string = process.env.VENDORS_SITE;
const vendorCraftApplicationsListGuid: string =
  process.env.VENDORS_CRAFT_APPLICATIONS_LIST_GUID;

const getCraftApplication = async (
  dbId: number,
  userId: string
): Promise<CraftFairApplicationWithUserId> => {
  const applications = await getCraftApplicationsByFilter(
    `ID eq '${dbId}' and UserId eq '${userId}'`
  );
  if (applications?.length) {
    return applications[0];
  } else {
    return null;
  }
};

const getCraftApplicationsForUser = async (
  userId: string
): Promise<CraftFairApplication[]> => {
  return getCraftApplicationsByFilter(`UserId eq '${userId}'`);
};

const getCraftApplicationsByFilter = async (
  filter?: string
): Promise<CraftFairApplicationWithUserId[]> => {
  return applyToItemsByFilter<
    CraftFairApplicationListItem,
    CraftFairApplicationWithUserId[]
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

export const createOrUpdateCraftApplication = async (
  craftApplication: CraftFairApplication,
  user: User
): Promise<CraftFairApplication> => {
  if (craftApplication.dbId) {
    const existingApplication = await getCraftApplication(
      craftApplication.dbId,
      user.userId
    );

    if (existingApplication) {
      const mergedApplication: CraftFairApplicationWithContact = {
        ...existingApplication,
        ...craftApplication,
        userId: user.userId,
        contactFirstNames: user.firstName,
        contactLastName: user.lastName,
        email: user.email,
      };

      return updateCraftApplication(mergedApplication);
    } else {
      throw new Error(
        "Cannot find existing application with dbId: " + craftApplication.dbId
      );
    }
  }

  return createCraftApplication({
    ...craftApplication,
    userId: user.userId,
    contactFirstNames: user.firstName,
    contactLastName: user.lastName,
    email: user.email,
  });
};

const updateCraftApplication = async (
  application: CraftFairApplicationWithContact
): Promise<CraftFairApplication> => {
  const listItem = craftApplicationToListItem(application);
  await updateItem(vendorSiteUrl, vendorCraftApplicationsListGuid, listItem);
  return application;
};

const createCraftApplication = async (
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
  craftApplication: CraftFairApplicationWithContact
): CraftFairApplicationListItem => {
  return {
    ID: craftApplication.dbId,
    Title: craftApplication.tradingName,
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
  };
};

const listItemToCraftApplication = (
  item: CraftFairApplicationListItem
): CraftFairApplicationWithContact => {
  return {
    dbId: item.ID,
    userId: item.UserId,
    tradingName: item.Title,
    addressLine1: item.AddressLine1,
    addressLine2: item.AddressLine2,
    city: item.City,
    state: item.State,
    postcode: item.Postcode,
    country: item.Country,
    contactFirstNames: item.ContactFirstName,
    contactLastName: item.ContactLastName,
    email: item.ContactEmail,
    landline: item.Landline,
    mobile: item.Mobile,
    descriptionOfStall: item.DescriptionOfStall,
    pitchType: "standardNoShelter",
    pitchAdditionalWidth: 0,
    pitchVanSpaceRequired: true,
    pitchElectricity: "none",
    campingRequired: true,
    tables: 0,
    created: item.Created,
  };
};

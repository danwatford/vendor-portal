import {
  CraftFairApplication,
  CraftFairApplicationRunType,
} from "../interfaces/applications";
import { getTotalCraftFairApplicationCost } from "./applications-pricing";

// Create a craft fair application based on input from an API client.
// This function allows us to ensure only desired properties are copied from the object provided by the API client.
export const sanitiseCraftApplicationFromApiClient = (
  maybeApplication: any
): CraftFairApplication => {
  delete maybeApplication.totalCost;
  const application = CraftFairApplicationRunType.check(maybeApplication);

  const sanitisedApplication: CraftFairApplication = {
    dbId: application.dbId,
    tradingName: application.tradingName,
    addressLine1: application.addressLine1,
    addressLine2: application.addressLine2,
    city: application.city,
    state: application.state,
    postcode: application.postcode,
    country: application.country,
    landline: application.landline,
    mobile: application.mobile,
    website: application.website,
    descriptionOfStall: application.descriptionOfStall,
    pitchType: application.pitchType,
    pitchAdditionalWidth: application.pitchAdditionalWidth,
    pitchVanSpaceRequired: application.pitchVanSpaceRequired,
    pitchElectricalOptions: application.pitchElectricalOptions,
    campingRequired: application.campingRequired,
    tables: application.tables,
  };

  sanitisedApplication.totalCost =
    getTotalCraftFairApplicationCost(sanitisedApplication);

  return sanitisedApplication;
};

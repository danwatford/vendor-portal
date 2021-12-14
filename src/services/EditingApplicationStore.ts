import {
  LocalCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";
import { getTotalCraftFairApplicationCost } from "./applications-pricing";

const EDIT_STORAGE_KEY = "vendorPortalEdit";

type EditingApplication =
  | LocalCraftFairApplication
  | SubmittedCraftFairApplication;

// Save the given application to the edit storage area.
export const saveToEditingApplicationStore = (
  craftApplication: EditingApplication
) => {
  // The tables and additional width properties of the CraftFairApplication should be numbers, but the Formik select
  // field used to edit the properties sets them to text. Convert to a number before writing to storage.
  const converted: EditingApplication = {
    ...craftApplication,
    tables: parseInt(craftApplication.tables.toString()),
    pitchAdditionalWidth: parseInt(
      craftApplication.pitchAdditionalWidth.toString()
    ),
  };

  converted.totalCost = getTotalCraftFairApplicationCost(converted);

  window.localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(converted));
};

// Retrieve the application from the edit storage area.
export const loadFromEditingApplicationStore =
  (): EditingApplication | null => {
    const json = window.localStorage.getItem(EDIT_STORAGE_KEY);

    if (json) {
      return JSON.parse(json);
    } else {
      return null;
    }
  };

// Clear the edit storage area.
export const clearEditingApplicationStore = () => {
  window.localStorage.removeItem(EDIT_STORAGE_KEY);
};

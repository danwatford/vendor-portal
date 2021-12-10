import { CraftFairApplication } from "../interfaces/Applications";

const CRAFT_STORAGE_KEY = "vendorPortalCraft";

export const getCurrentCraftApplication = (): CraftFairApplication | null => {
  const savedForm = window.localStorage.getItem(CRAFT_STORAGE_KEY);

  if (savedForm) {
    return JSON.parse(savedForm);
  } else {
    return null;
  }
};

export const saveCurrentCraftApplication = (
  craftApplication: CraftFairApplication
) => {
  // The tables property of the CraftFairApplication should be a number, but the Formik select field used
  // to edit the property sets it to text. Convert to a number before writing to storage.
  const converted: CraftFairApplication = {
    ...craftApplication,
    tables: parseInt(craftApplication.tables.toString()),
  };

  window.localStorage.setItem(CRAFT_STORAGE_KEY, JSON.stringify(converted));
};

export const clearCurrentCraftApplication = () => {
  window.localStorage.removeItem(CRAFT_STORAGE_KEY);
};

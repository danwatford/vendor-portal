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
  window.localStorage.setItem(
    CRAFT_STORAGE_KEY,
    JSON.stringify(craftApplication)
  );
};

export const clearCurrentCraftApplication = () => {
  window.localStorage.removeItem(CRAFT_STORAGE_KEY);
};

import { CraftFairApplication } from "../interfaces/Applications";

const CURRENT_CRAFT_APPLICATION_KEY = "currentCraftApplication";
/**
 * Retrieve the current craft fair form values from local storage so they can be used when rendering a new form.
 */
const getCurrentCraftApplicationFromStorage = (): CraftFairApplication => {
  const storedApplication = localStorage.getItem(CURRENT_CRAFT_APPLICATION_KEY);
  if (storedApplication) {
    return JSON.parse(storedApplication);
  } else {
    return {
      stallholderName: "",
      tradingAs: "",
      address: "",
      postcode: "",
      landline: "",
      mobile: "",
      email: "",
      descriptionOfStall: "",
    };
  }
};

export const saveCurrentCraftApplicationToStorage = (
  application: CraftFairApplication
) => {
  localStorage.setItem(
    CURRENT_CRAFT_APPLICATION_KEY,
    JSON.stringify(application)
  );
};

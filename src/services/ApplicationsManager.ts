import { CraftFairApplication } from "../interfaces/Applications";
import {
  getCurrentCraftApplication,
  saveCurrentCraftApplication,
} from "./LocalApplicationsStore";

export const submitCurrentCraftApplication = async (): Promise<void> => {
  const currentCraftApplication = getCurrentCraftApplication();
  if (!currentCraftApplication) {
    throw new Error("No current craft application available for submission.");
  }

  const body = JSON.stringify(currentCraftApplication);

  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const submitResponse = await fetch("/api/submitCraftApplication", options);
  if (submitResponse.status === 200) {
    const responseCraftApplication: CraftFairApplication =
      await submitResponse.json();

    saveCurrentCraftApplication(responseCraftApplication);
  } else {
    throw new Error(
      `Status code: ${submitResponse.status} when submitting application.`
    );
  }
};

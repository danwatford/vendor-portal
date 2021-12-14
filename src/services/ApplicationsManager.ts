import {
  isLocalCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";
import {
  clearCurrentEditingApplication,
  clearDraft,
  getCurrentEditingApplication,
  saveCurrentEditingApplicationAsDraft,
} from "./LocalApplicationsStore";

const applicationListSubscribers: Array<() => void> = [];
let refreshingApplications = false;
let applications: Array<SubmittedCraftFairApplication> = [];

export const subscribeApplicationListChange = (subscriber: () => void) => {
  applicationListSubscribers.push(subscriber);
};

export const saveCurrentDraftApplication = () => {
  saveCurrentEditingApplicationAsDraft();
};

export const getApplications = () => applications;

export const refreshApplicationsList = async () => {
  refreshingApplications = true;
  notifyApplicationListChangeSubscribers();
  try {
    const res = await fetch("/api/getApplications");
    const json: SubmittedCraftFairApplication[] = await res.json();
    if (json) {
      applications = json;
    }
  } catch (e) {
    console.error(`Failed to unpack applications from JSON.`, e);
  }
  refreshingApplications = false;
  notifyApplicationListChangeSubscribers();
};

export const isRefreshingApplications = () => refreshingApplications;

export const submitCurrentCraftApplication = async (): Promise<void> => {
  const currentCraftApplication = getCurrentEditingApplication();
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
    if (isLocalCraftFairApplication(currentCraftApplication)) {
      // Application was a draft. Now it has been successfully submitted it should be removed from
      // the drafts storage.
      clearDraft(currentCraftApplication.draftId);
    }

    clearCurrentEditingApplication();
    refreshApplicationsList();
  } else {
    throw new Error(
      `Status code: ${submitResponse.status} when submitting application.`
    );
  }
};

const notifyApplicationListChangeSubscribers = () => {
  applicationListSubscribers.forEach((subscription) => subscription());
};

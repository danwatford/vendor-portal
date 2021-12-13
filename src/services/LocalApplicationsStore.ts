import {
  CraftFairApplication,
  initialCraftFairApplication,
  LocalCraftFairApplication,
} from "../interfaces/Applications";
import { getTotalCraftFairApplicationCost } from "./applications-pricing";

const MAX_DRAFTS = 10;
const DRAFTS_STORAGE_KEY = "vendorPortalDrafts";
const EDIT_STORAGE_KEY = "vendorPortalCraft";

const draftApplicationListSubscribers: Array<() => void> = [];
export const subscribeDraftApplicationListChange = (subscriber: () => void) => {
  draftApplicationListSubscribers.push(subscriber);
};

// Retrieve existing drafts from local storage.
export const getDrafts = (): Array<LocalCraftFairApplication | null> => {
  const storedItem = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
  if (storedItem) {
    return JSON.parse(storedItem);
  } else {
    return Array(MAX_DRAFTS).fill(null);
  }
};

// Create a new draft, with draftId, in the edit storage area ready for use by a form.
export const prepareNewDraft = (): boolean => {
  const draftId = getAvailableDraftId();
  if (draftId !== null) {
    saveCurrentEditingApplication({
      ...initialCraftFairApplication,
      draftId,
    });
    return true;
  } else {
    // No draft slots available.
    return false;
  }
};

// Copy an existing draft to the edit storage ready for use by a form.
export const prepareExistingDraft = (draftId: number): boolean => {
  const drafts = getDrafts();
  const draft = drafts[draftId];
  if (draft) {
    saveCurrentEditingApplication(draft);
    return true;
  } else {
    return false;
  }
};

// Take the current draft in the edit storage area and save to the drafts storage area.
export const saveCurrentEditingApplicationAsDraft = () => {
  const currentEditingApplication = getCurrentEditingApplication();

  if (!currentEditingApplication) {
    throw new Error("Attempted to save a missing application to drafts.");
  }

  // Don't save applications to drafts if they have previously been submitted, i.e. they already have a database ID.
  if (currentEditingApplication?.dbId) {
    throw new Error(
      "Attempted to save a previously submitted application to drafts storage."
    );
  }

  updateDraft(currentEditingApplication);
  clearCurrentEditingApplication();
};

export const clearDraft = (draftId: number) => {
  const drafts = getDrafts();
  if (draftId >= 0 && draftId < MAX_DRAFTS) {
    drafts[draftId] = null;
  }

  storeDrafts(drafts);
};

// Retrieve the application from the edit storage area.
export const getCurrentEditingApplication =
  (): LocalCraftFairApplication | null => {
    const savedForm = window.localStorage.getItem(EDIT_STORAGE_KEY);

    if (savedForm) {
      return JSON.parse(savedForm);
    } else {
      return null;
    }
  };

// Save the given application to the edit storage area.
export const saveCurrentEditingApplication = (
  craftApplication: LocalCraftFairApplication
) => {
  // The tables and additional width properties of the CraftFairApplication should be numbers, but the Formik select
  // field used to edit the properties sets them to text. Convert to a number before writing to storage.
  const converted: CraftFairApplication = {
    ...craftApplication,
    tables: parseInt(craftApplication.tables.toString()),
    pitchAdditionalWidth: parseInt(
      craftApplication.pitchAdditionalWidth.toString()
    ),
  };

  converted.totalCost = getTotalCraftFairApplicationCost(converted);

  window.localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(converted));
};

// Clear the edit storage area.
export const clearCurrentEditingApplication = () => {
  window.localStorage.removeItem(EDIT_STORAGE_KEY);
};

const getAvailableDraftId = (): number | null => {
  const drafts = getDrafts();
  const index = drafts.findIndex((v) => v === null);
  if (index === -1) {
    // No free draft slots.
    return null;
  }
  return index;
};

const updateDraft = (application: LocalCraftFairApplication) => {
  const currentDateTime = new Date();
  application.lastSaved = currentDateTime.toLocaleString();

  const drafts: Array<LocalCraftFairApplication | null> = getDrafts();
  let index = application.draftId;
  drafts[index] = application;
  storeDrafts(drafts);
};

const storeDrafts = (drafts: Array<LocalCraftFairApplication | null>) => {
  window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  notifyDraftApplicationListChangeSubscribers();
};

const notifyDraftApplicationListChangeSubscribers = () => {
  draftApplicationListSubscribers.forEach((subscription) => subscription());
};

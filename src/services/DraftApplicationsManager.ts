import { DateTime } from "luxon";
import {
  initialCraftFairApplication,
  isSubmittedCraftFairApplication,
  DraftCraftFairApplication,
} from "../interfaces/Applications";
import {
  clearDraftFromStore,
  getAvailableDraftId,
  getDraftsFromStore,
  writeDraftToStore,
} from "./DraftApplicationsStore";
import {
  clearEditingApplicationStore,
  loadFromEditingApplicationStore,
  saveToEditingApplicationStore,
} from "./EditingApplicationStore";

const draftApplicationListSubscribers: Array<() => void> = [];
export const subscribeDraftApplicationListChange = (subscriber: () => void) => {
  draftApplicationListSubscribers.push(subscriber);
};

export const getDrafts = () => {
  return getDraftsFromStore();
};

// Create a new draft, with draftId, in the edit storage area ready for use by a form.
export const prepareNewDraftForEditing = (): boolean => {
  const draftId = getAvailableDraftId();
  if (draftId !== null) {
    saveToEditingApplicationStore({
      ...initialCraftFairApplication,
      draftId,
      lastSaved: "",
    });
    return true;
  } else {
    // No draft slots available.
    return false;
  }
};

// Copy an existing draft to the edit storage ready for use by a form.
export const prepareExistingDraft = (draftId: number): boolean => {
  const drafts = getDraftsFromStore();
  const draft = drafts[draftId];
  if (draft) {
    saveToEditingApplicationStore(draft);
    return true;
  } else {
    return false;
  }
};

// Take the current draft in the edit storage area and save to the drafts storage area.
export const saveEditingApplicationAsDraft = () => {
  const currentEditingApplication = loadFromEditingApplicationStore();

  if (!currentEditingApplication) {
    throw new Error("Attempted to save a missing application to drafts.");
  }

  // Don't save applications to drafts if they have previously been submitted.
  if (isSubmittedCraftFairApplication(currentEditingApplication)) {
    throw new Error(
      "Attempted to save a previously submitted application to drafts storage."
    );
  }

  updateDraft(currentEditingApplication);
  clearEditingApplicationStore();
  notifyDraftApplicationListChangeSubscribers();
};

// Remove a draft application. This is expected to be called following successful submission of a draft.
export const removeDraft = (draftId: number) => {
  clearDraftFromStore(draftId);
  notifyDraftApplicationListChangeSubscribers();
};

const updateDraft = (application: DraftCraftFairApplication) => {
  const currentDateTime = DateTime.now();
  application.lastSaved = currentDateTime.toISO();

  writeDraftToStore(application);
};

const notifyDraftApplicationListChangeSubscribers = () => {
  draftApplicationListSubscribers.forEach((subscription) => subscription());
};

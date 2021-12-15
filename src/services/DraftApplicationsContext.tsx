import React, { useCallback, useContext, useEffect, useState } from "react";
import { DraftCraftFairApplication } from "../interfaces/Applications";
import {
  getDrafts,
  removeDraft,
  subscribeDraftApplicationListChange,
} from "./DraftApplicationsManager";

export type IDraftApplicationsContext = {
  draftApplications: DraftCraftFairApplication[];
  deleteApplication: (application: DraftCraftFairApplication) => Promise<void>;
};

const DraftApplicationsContext = React.createContext<IDraftApplicationsContext>(
  {
    draftApplications: [],
    deleteApplication: () => {
      throw new Error(
        "DraftApplicationsContext consumer is not wrapped in a corresponding provider."
      );
    },
  }
);

function isNotNull<T>(argument: T | null): argument is T {
  return argument !== null;
}

const DraftApplicationsContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [draftApplications, setDraftApplications] = useState<
    DraftCraftFairApplication[]
  >([]);

  const getDraftApplications = useCallback(() => {
    const drafts = getDrafts();
    const filteredDrafts = drafts.filter(isNotNull);
    setDraftApplications(filteredDrafts);
  }, []);

  const deleteApplication = useCallback(
    async (application: DraftCraftFairApplication) => {
      removeDraft(application.draftId);
    },
    []
  );

  const draftApplicationsListChangeHandler = useCallback(() => {
    getDraftApplications();
  }, [getDraftApplications]);

  useEffect(() => {
    subscribeDraftApplicationListChange(draftApplicationsListChangeHandler);
  }, [draftApplicationsListChangeHandler]);

  useEffect(getDraftApplications, [getDraftApplications]);

  return (
    <DraftApplicationsContext.Provider
      value={{ draftApplications, deleteApplication }}
    >
      {children}
    </DraftApplicationsContext.Provider>
  );
};

const useDraftApplications = () => useContext(DraftApplicationsContext);

export { DraftApplicationsContextProvider, useDraftApplications };

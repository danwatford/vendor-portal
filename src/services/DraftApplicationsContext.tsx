import React, { useCallback, useContext, useEffect, useState } from "react";
import { DraftCraftFairApplication } from "../interfaces/Applications";
import {
  getDrafts,
  subscribeDraftApplicationListChange,
} from "./DraftApplicationsManager";

export type IDraftApplicationsContext = {
  draftApplications: DraftCraftFairApplication[];
};

const DraftApplicationsContext = React.createContext<IDraftApplicationsContext>(
  {
    draftApplications: [],
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

  const draftApplicationsListChangeHandler = useCallback(() => {
    getDraftApplications();
  }, [getDraftApplications]);

  useEffect(() => {
    subscribeDraftApplicationListChange(draftApplicationsListChangeHandler);
  }, [draftApplicationsListChangeHandler]);

  useEffect(getDraftApplications, [getDraftApplications]);

  return (
    <DraftApplicationsContext.Provider value={{ draftApplications }}>
      {children}
    </DraftApplicationsContext.Provider>
  );
};

const useDraftApplications = () => useContext(DraftApplicationsContext);

export { DraftApplicationsContextProvider, useDraftApplications };

import React, { useCallback, useContext, useEffect, useState } from "react";
import { CraftFairApplicationWithContact } from "../interfaces/Applications";
import {
  getApplications,
  isRefreshingApplications,
  refreshApplicationsList,
  subscribeApplicationListChange,
} from "./ApplicationsManager";
import { useUserProfile } from "./UserProfileContext";

export type IApplicationsContext = {
  loaded: boolean;
  applications: CraftFairApplicationWithContact[];
  refreshApplications: () => void;
};

const ApplicationsContext = React.createContext<IApplicationsContext>({
  loaded: false,
  applications: [],
  refreshApplications: () => {
    throw new Error(
      "ApplicationsContext consumer is not wrapped in a corresponding provider."
    );
  },
});

const ApplicationsContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { userProfile } = useUserProfile();
  const [applications, setApplications] = useState<
    CraftFairApplicationWithContact[]
  >(() => getApplications());
  const [loaded, setLoaded] = useState(() => !isRefreshingApplications());

  const fetchApplications = useCallback(async () => {
    refreshApplicationsList();
  }, []);

  const applicationsListChangeHandler = useCallback(() => {
    setLoaded(!isRefreshingApplications());
    setApplications(getApplications());
  }, []);

  useEffect(() => {
    subscribeApplicationListChange(applicationsListChangeHandler);
  }, [applicationsListChangeHandler]);

  useEffect(() => {
    if (userProfile) {
      fetchApplications();
    }
  }, [userProfile, fetchApplications]);

  return (
    <ApplicationsContext.Provider
      value={{ loaded, applications, refreshApplications: fetchApplications }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};

const useApplications = () => useContext(ApplicationsContext);

export { ApplicationsContextProvider, useApplications };

import React, { useCallback, useContext, useEffect, useState } from "react";
import { SubmittedCraftFairApplication } from "../interfaces/Applications";
import {
  getApplications,
  getApplicationsError,
  isRefreshingApplications,
  refreshApplicationsList,
  subscribeApplicationListChange,
} from "./ApplicationsManager";
import { useUserProfile } from "./UserProfileContext";

export type IApplicationsContext = {
  loaded: boolean;
  applications: SubmittedCraftFairApplication[];
  error: string;
  refreshApplications: () => void;
};

const ApplicationsContext = React.createContext<IApplicationsContext>({
  loaded: false,
  applications: [],
  error: "",
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
    SubmittedCraftFairApplication[]
  >(() => getApplications());
  const [error, setError] = useState<string>(() => getApplicationsError());
  const [loaded, setLoaded] = useState(() => !isRefreshingApplications());

  const fetchApplications = useCallback(async () => {
    refreshApplicationsList();
  }, []);

  const applicationsListChangeHandler = useCallback(() => {
    setLoaded(!isRefreshingApplications());
    setApplications(getApplications());
    setError(getApplicationsError());
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
      value={{
        loaded,
        applications,
        error,
        refreshApplications: fetchApplications,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};

const useApplications = () => useContext(ApplicationsContext);

export { ApplicationsContextProvider, useApplications };

import React, { useCallback, useContext, useEffect, useState } from "react";
import { SubmittedCraftFairApplication } from "../interfaces/Applications";
import {
  getApplications,
  getApplicationsError,
  isRefreshingApplications,
  refreshApplicationsList,
  subscribeApplicationListChange,
  deleteApplication as managerDeleteApplication,
  completeApplication as managerCompleteApplication,
} from "./ApplicationsManager";
import { useUserProfile } from "./UserProfileContext";

export type IApplicationsContext = {
  loaded: boolean;
  applications: SubmittedCraftFairApplication[];
  error: string;
  currentApplication: SubmittedCraftFairApplication | null;
  setCurrentApplication: (application: SubmittedCraftFairApplication) => void;
  clearCurrentApplication: () => void;
  refreshApplications: () => Promise<void>;
  deleteApplication: (
    application: SubmittedCraftFairApplication
  ) => Promise<void>;
  completeApplication: (
    application: SubmittedCraftFairApplication
  ) => Promise<void>;
};

const invalidFunction = () => {
  throw new Error(
    "ApplicationsContext consumer is not wrapped in a corresponding provider."
  );
};
const ApplicationsContext = React.createContext<IApplicationsContext>({
  loaded: false,
  applications: [],
  error: "",
  currentApplication: null,
  setCurrentApplication: invalidFunction,
  clearCurrentApplication: invalidFunction,
  refreshApplications: invalidFunction,
  deleteApplication: invalidFunction,
  completeApplication: invalidFunction,
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
  const [currentApplication, setCurrentApplication] =
    useState<SubmittedCraftFairApplication | null>(null);

  const fetchApplications = useCallback(async () => {
    await refreshApplicationsList();
  }, []);

  const deleteApplication = useCallback(
    async (application: SubmittedCraftFairApplication) => {
      await managerDeleteApplication(application);
    },
    []
  );

  const completeApplication = useCallback(
    async (application: SubmittedCraftFairApplication) => {
      await managerCompleteApplication(application);
    },
    []
  );

  const applicationsListChangeHandler = useCallback(() => {
    setLoaded(!isRefreshingApplications());
    setApplications([...getApplications()]);
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
        currentApplication,
        setCurrentApplication,
        clearCurrentApplication: () => {
          setCurrentApplication(null);
        },
        refreshApplications: fetchApplications,
        deleteApplication,
        completeApplication,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};

const useApplications = () => useContext(ApplicationsContext);

export { ApplicationsContextProvider, useApplications };

import React, { useCallback, useContext, useEffect, useState } from "react";
import { CraftFairApplicationWithContact } from "../interfaces/Applications";
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
  >([]);
  const [loaded, setLoaded] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoaded(false);
      const res = await fetch("/api/getApplications");
      const json: CraftFairApplicationWithContact[] = await res.json();
      if (json) {
        setApplications(json);
      }
    } catch (e) {
      console.error(`Failed to unpack applications from JSON.`, e);
    }
    setLoaded(true);
  }, []);

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

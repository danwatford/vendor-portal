import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./Home";
import { useUserProfile } from "../services/UserProfileContext";
import Spinner from "./Spinner";
import CraftApplicationForm from "./forms/CraftApplicationForm";
import SubmittingCraftApplication from "./SubmittingCraftApplication";
import { useEffect } from "react";
import { useApplications } from "../services/ApplicationsContext";
import UploadDocuments from "./forms/UploadDocuments";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout: React.FC = () => {
  const { loaded } = useUserProfile();
  const { currentApplication } = useApplications();

  if (!loaded) {
    return (
      <div className="flex flex-col h-screen bg-bfw-yellow">
        <div className="flex-grow" />
        <Spinner />
        <div className="flex-grow" />
      </div>
    );
  }

  // return content;
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/craftApplication" element={<CraftApplicationForm />} />
        <Route
          path="/submittingCraftApplication"
          element={<SubmittingCraftApplication />}
        />
        {!!currentApplication ? (
          <Route path="/uploadDocuments" element={<UploadDocuments />} />
        ) : null}
      </Routes>
    </>
  );
};

export default Layout;

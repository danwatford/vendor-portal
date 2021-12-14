import { useNavigate } from "react-router-dom";
import { SubmittedCraftFairApplication } from "../interfaces/Applications";
import { useApplications } from "../services/ApplicationsContext";
import { prepareExistingSubmissionForEditing } from "../services/ApplicationsManager";
import ApplicationListItem from "./ApplicationListItem";

const SubmittedApplicationsList: React.FC = () => {
  const { loaded, applications, refreshApplications } = useApplications();
  const navigate = useNavigate();

  if (!loaded) {
    return <div>Loading applications...</div>;
  }

  if (!applications) {
    return <div>No applications</div>;
  }

  const clickHandler = (application: SubmittedCraftFairApplication) => {
    prepareExistingSubmissionForEditing(application);
    navigate("/craftApplication");
  };

  const applicationsComponents = applications.map((application, index) => (
    <ApplicationListItem
      key={index}
      application={application}
      clickHandler={() => clickHandler(application)}
    />
  ));

  return (
    <div className="ml-2">
      <div className="text-right">
        <button onClick={refreshApplications}>Refresh</button>
      </div>
      <div>{applicationsComponents}</div>
    </div>
  );
};

const SubmittedApplicationsPanel = () => {
  return (
    <div className="text-left">
      <h2 className="mt-4 text-xl ">Existing applications</h2>
      <SubmittedApplicationsList />
    </div>
  );
};

export default SubmittedApplicationsPanel;

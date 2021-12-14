import { useNavigate } from "react-router-dom";
import { SubmittedCraftFairApplication } from "../interfaces/Applications";
import { useApplications } from "../services/ApplicationsContext";
import { prepareExistingSubmissionForEditing } from "../services/ApplicationsManager";
import ApplicationListItem from "./ApplicationListItem";

const SubmittedApplicationsList: React.FC = () => {
  const { loaded, applications, error } = useApplications();
  const navigate = useNavigate();

  let applicationsComponents;

  if (error) {
    applicationsComponents = <div>Error retrieving submitted applications</div>;
  } else if (!loaded) {
    applicationsComponents = <div>Loading applications...</div>;
  } else if (!applications) {
    applicationsComponents = <div>No applications</div>;
  } else {
    const clickHandler = (application: SubmittedCraftFairApplication) => {
      prepareExistingSubmissionForEditing(application);
      navigate("/craftApplication");
    };

    applicationsComponents = applications.map((application, index) => (
      <ApplicationListItem
        key={index}
        application={application}
        clickHandler={() => clickHandler(application)}
      />
    ));
  }

  return (
    <div className="ml-2">
      <div>{applicationsComponents}</div>
    </div>
  );
};

const SubmittedApplicationsPanel = () => {
  const { refreshApplications } = useApplications();
  return (
    <div className="text-left">
      <div className="flex flex-row justify-between my-4">
        <h2 className="text-xl">Submitted applications</h2>
        <div className="">
          <button onClick={refreshApplications}>Refresh</button>
        </div>
      </div>
      <SubmittedApplicationsList />
    </div>
  );
};

export default SubmittedApplicationsPanel;

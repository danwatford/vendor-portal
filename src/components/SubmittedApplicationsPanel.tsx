import { useNavigate } from "react-router-dom";
import { SubmittedCraftFairApplication } from "../interfaces/Applications";
import { useApplications } from "../services/ApplicationsContext";
import { prepareExistingSubmissionForEditing } from "../services/ApplicationsManager";
import ApplicationListItem from "./ApplicationListItem";

const SubmittedApplicationsList: React.FC = () => {
  const { loaded, applications, error, deleteApplication } = useApplications();
  const navigate = useNavigate();

  let applicationsComponents;

  if (error) {
    applicationsComponents = <div>Error retrieving submitted applications</div>;
  } else if (!loaded) {
    applicationsComponents = <div>Loading applications...</div>;
  } else if (!applications || applications.length === 0) {
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
        deleteHandler={() => deleteApplication(application)}
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

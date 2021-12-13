import { useApplications } from "../services/ApplicationsContext";
import ApplicationListItem from "./ApplicationListItem";

const SubmittedApplicationsList: React.FC = () => {
  const { loaded, applications, refreshApplications } = useApplications();

  if (!loaded) {
    return <div>Loading applications...</div>;
  }

  if (!applications) {
    return <div>No applications</div>;
  }

  const clickHandler = (i: number) => {
    // do nothing
  };

  const applicationsComponents = applications.map((application, index) => (
    <ApplicationListItem
      key={index}
      application={application}
      clickHandler={() => clickHandler(index)}
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

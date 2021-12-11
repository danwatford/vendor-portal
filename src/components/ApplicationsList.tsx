import { useApplications } from "../services/ApplicationsContext";

const ApplicationsList: React.FC = () => {
  const { loaded, applications, refreshApplications } = useApplications();

  if (!loaded) {
    return <div>Loading applications...</div>;
  }

  if (!applications) {
    return <div>No applications</div>;
  }

  const applicationsComponents = applications.map((application, index) => {
    return (
      <div
        key={index}
        className={
          "p-2 " + (index % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100")
        }
      >
        <span className="block">{application.tradingName}</span>
        <span>Submitted: {application.created}</span>
        <span>Total: {application.totalCost}</span>
      </div>
    );
  });

  return (
    <div className="ml-2 border-2 rounded">
      <div className="text-right">
        <button onClick={refreshApplications}>Refresh</button>
      </div>
      {applicationsComponents}
    </div>
  );
};

export default ApplicationsList;

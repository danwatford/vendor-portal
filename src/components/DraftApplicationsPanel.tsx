import { useNavigate } from "react-router-dom";
import { useDraftApplications } from "../services/DraftApplicationsContext";
import { prepareExistingDraft } from "../services/DraftApplicationsManager";
import ApplicationListItem from "./ApplicationListItem";

const DraftApplicationsList: React.FC = () => {
  const { draftApplications, deleteApplication } = useDraftApplications();
  const navigate = useNavigate();

  if (!draftApplications) {
    return <div>No drafts</div>;
  }

  const clickHandler = (i: number) => {
    const draft = draftApplications[i];
    prepareExistingDraft(draft.draftId);
    navigate("/craftApplication");
  };

  const deleteClickHandler = async (i: number): Promise<void> => {
    const draft = draftApplications[i];
    await deleteApplication(draft);
  };

  const draftApplicationsCount = draftApplications.reduce(
    (prevCount, application) => {
      if (application) {
        return prevCount + 1;
      } else {
        return prevCount;
      }
    },
    0
  );

  let applicationsComponents;
  if (!draftApplicationsCount) {
    applicationsComponents = <div>No applications</div>;
  } else {
    applicationsComponents = draftApplications.map((application, index) => (
      <ApplicationListItem
        key={index}
        application={application}
        clickHandler={() => clickHandler(index)}
        deleteHandler={() => deleteClickHandler(index)}
      />
    ));
  }

  return <div className="ml-2">{applicationsComponents}</div>;
};

const DraftApplicationsPanel = () => {
  return (
    <div className="text-left">
      <h2 className="my-4 text-xl ">
        Draft applications stored on this device
      </h2>
      <DraftApplicationsList />
    </div>
  );
};

export default DraftApplicationsPanel;

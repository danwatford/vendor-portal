import { useNavigate } from "react-router-dom";
import { useDraftApplications } from "../services/DraftApplicationsContext";
import { prepareExistingDraft } from "../services/LocalApplicationsStore";

const DraftApplicationsList: React.FC = () => {
  const { draftApplications } = useDraftApplications();
  const navigate = useNavigate();

  if (!draftApplications) {
    return <div>No drafts</div>;
  }

  const clickHandler = (i: number) => {
    const draft = draftApplications[i];
    prepareExistingDraft(draft.draftId);
    navigate("/craftApplication");
  };

  const applicationsComponents = draftApplications.map((application, index) => {
    return (
      <div
        key={index}
        onClick={() => clickHandler(index)}
        className={
          "p-2 " + (index % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100")
        }
      >
        <span className="block">{application.tradingName}</span>
        <span>Saved: {application.lastSaved}</span>
        <span>Total: {application.totalCost}</span>
      </div>
    );
  });

  return <div className="ml-2 border-2 rounded">{applicationsComponents}</div>;
};

export default DraftApplicationsList;

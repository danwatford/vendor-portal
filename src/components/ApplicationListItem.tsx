import {
  isDraftCraftFairApplication,
  isSubmittedCraftFairApplication,
  DraftCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";

type Appl<T extends DraftCraftFairApplication | SubmittedCraftFairApplication> =
  T extends DraftCraftFairApplication
    ? DraftCraftFairApplication
    : SubmittedCraftFairApplication;

export interface ApplicationListItemProps<
  T extends DraftCraftFairApplication | SubmittedCraftFairApplication
> {
  application: Appl<T>;
  clickHandler: (application: Appl<T>) => void;
  deleteHandler: (application: Appl<T>) => void;
}

const ApplicationListItem = <
  T extends DraftCraftFairApplication | SubmittedCraftFairApplication
>({
  application,
  clickHandler,
  deleteHandler,
}: ApplicationListItemProps<T>): JSX.Element => {
  let timestampComponent;
  if (isDraftCraftFairApplication(application)) {
    timestampComponent = <span>Saved: {application.lastSaved}</span>;
  } else if (isSubmittedCraftFairApplication(application)) {
    timestampComponent = <span>Submitted: {application.created}</span>;
  }

  return (
    <div className="flex flex-row p-2 even:bg-yellow-50 odd:bg-yellow-100 hover:bg-yellow-200 first:rounded-t-lg last:rounded-b-lg">
      <div
        onClick={() => clickHandler(application)}
        className="flex-auto block cursor-pointer "
      >
        <span className="block">{application.tradingName}</span>
        <span className="block">{timestampComponent}</span>
        <span className="block">Total: £{application.totalCost}</span>
      </div>
      <div className="">
        <button onClick={() => deleteHandler(application)}>Delete</button>
      </div>
    </div>
  );
};

export default ApplicationListItem;

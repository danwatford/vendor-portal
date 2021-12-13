import {
  CraftFairApplicationWithContact,
  LocalCraftFairApplication,
} from "../interfaces/Applications";

type Appl<
  T extends LocalCraftFairApplication | CraftFairApplicationWithContact
> = T extends LocalCraftFairApplication
  ? LocalCraftFairApplication
  : CraftFairApplicationWithContact;

function isLocalCraftFairApplication(
  application: LocalCraftFairApplication | CraftFairApplicationWithContact
): application is LocalCraftFairApplication {
  return (application as LocalCraftFairApplication).draftId !== undefined;
}

function isCraftFairApplicationWithContact(
  application: LocalCraftFairApplication | CraftFairApplicationWithContact
): application is CraftFairApplicationWithContact {
  return (application as CraftFairApplicationWithContact).dbId !== undefined;
}

export interface ApplicationListItemProps<
  T extends LocalCraftFairApplication | CraftFairApplicationWithContact
> {
  application: Appl<T>;
  clickHandler: (application: Appl<T>) => void;
}

const ApplicationListItem = <
  T extends LocalCraftFairApplication | CraftFairApplicationWithContact
>({
  application,
  clickHandler,
}: ApplicationListItemProps<T>): JSX.Element => {
  let timestampComponent;
  if (isLocalCraftFairApplication(application)) {
    timestampComponent = <span>Saved: {application.lastSaved}</span>;
  } else if (isCraftFairApplicationWithContact(application)) {
    timestampComponent = <span>Submitted: {application.created}</span>;
  }

  return (
    <div
      onClick={() => clickHandler(application)}
      className="block p-2 even:bg-yellow-50 odd:bg-yellow-100 hover:bg-yellow-200 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
    >
      <span className="block">{application.tradingName}</span>
      <span className="block">{timestampComponent}</span>
      <span className="block">Total: £{application.totalCost}</span>
    </div>
  );
};

export default ApplicationListItem;

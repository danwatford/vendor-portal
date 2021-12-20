import {
  DraftCraftFairApplication,
  isSubmittedCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";

type EitherApplication =
  | DraftCraftFairApplication
  | SubmittedCraftFairApplication;

type ConditionalApplication<T extends EitherApplication> =
  T extends DraftCraftFairApplication
    ? DraftCraftFairApplication
    : SubmittedCraftFairApplication;

interface ApplicationControlsProps<T extends EitherApplication> {
  application: ConditionalApplication<T>;
  editButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
  deleteButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
  payButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
  uploadDocumentsButtonClicked: React.MouseEventHandler<HTMLButtonElement>;
}

const isEditable = (application: EitherApplication): boolean => {
  if (isSubmittedCraftFairApplication(application)) {
    return (
      application.status === "Submitted" ||
      application.status === "Pending Deposit" ||
      application.status === "Pending Document Upload"
    );
  } else {
    // Draft applications are always editable.
    return true;
  }
};

const isDeletable = (application: EitherApplication): boolean => {
  if (isSubmittedCraftFairApplication(application)) {
    return (
      application.status === "Submitted" ||
      application.status === "Pending Deposit"
    );
  } else {
    // Draft applications are always deletable.
    return true;
  }
};

const isPayable = (application: EitherApplication): boolean => {
  if (isSubmittedCraftFairApplication(application)) {
    return (
      application.status === "Pending Deposit" ||
      application.status === "Accepted Pending Payment"
    );
  } else {
    // Unsubmitted applications cannot be paid for.
    return false;
  }
};

const isDocumentsUploadable = (application: EitherApplication): boolean => {
  if (isSubmittedCraftFairApplication(application)) {
    return application.status === "Pending Document Upload";
  } else {
    return false;
  }
};

interface ControlsButtonProps {
  text: string;
  className: string;
  buttonClickedHander: React.MouseEventHandler<HTMLButtonElement>;
}
const ControlsButton: React.FC<ControlsButtonProps> = ({
  text,
  className,
  buttonClickedHander,
}) => {
  return (
    <button
      onClick={buttonClickedHander}
      className={`w-full py-2 self-center rounded-full ${className}`}
    >
      {text}
    </button>
  );
};

const ApplicationListItemControls = <T extends EitherApplication>({
  application,
  editButtonClicked,
  deleteButtonClicked,
  payButtonClicked,
  uploadDocumentsButtonClicked,
}: ApplicationControlsProps<T>) => {
  const editComponent = isEditable(application) ? (
    <ControlsButton
      text="Edit"
      className="bg-yellow-400"
      buttonClickedHander={editButtonClicked}
    />
  ) : null;

  const deleteComponent = isDeletable(application) ? (
    <ControlsButton
      text="Delete"
      className="bg-red-400"
      buttonClickedHander={deleteButtonClicked}
    />
  ) : null;

  const paymentComponent = isPayable(application) ? (
    <button
      onClick={payButtonClicked}
      className="w-full py-2 self-center bg-green-300 rounded-full"
    >
      Pay now
    </button>
  ) : null;

  const uploadComponent = isDocumentsUploadable(application) ? (
    <button
      onClick={uploadDocumentsButtonClicked}
      className="w-full py-2 self-center bg-green-300 rounded-full"
    >
      Upload Documents
    </button>
  ) : null;

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        {editComponent}
        {paymentComponent}
        {deleteComponent}
        {uploadComponent}
      </div>
    </>
  );
};

export default ApplicationListItemControls;

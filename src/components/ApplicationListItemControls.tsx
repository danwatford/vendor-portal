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
  deleteButtonClickedHander: React.MouseEventHandler<HTMLButtonElement>;
  payButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement>;
  uploadDocumentsButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement>;
}

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

const ApplicationListItemControls = <T extends EitherApplication>({
  application,
  deleteButtonClickedHander: deleteClickedHander,
  payButtonClickedHandler: payClickedHandler,
  uploadDocumentsButtonClickedHandler: uploadClickedHandler,
}: ApplicationControlsProps<T>) => {
  const deleteComponent = isDeletable(application) ? (
    <button
      onClick={deleteClickedHander}
      className="w-full py-2 self-center bg-red-400 rounded-full"
    >
      {" "}
      Delete
    </button>
  ) : null;

  const paymentComponent = isPayable(application) ? (
    <button
      onClick={payClickedHandler}
      className="w-full py-2 self-center bg-green-300 rounded-full"
    >
      Pay now
    </button>
  ) : null;

  const uploadComponent = isDocumentsUploadable(application) ? (
    <button
      onClick={uploadClickedHandler}
      className="w-full py-2 self-center bg-green-300 rounded-full"
    >
      Upload Documents
    </button>
  ) : null;

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        {paymentComponent}
        {deleteComponent}
        {uploadComponent}
      </div>
    </>
  );
};

export default ApplicationListItemControls;

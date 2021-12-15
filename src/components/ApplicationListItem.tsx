import { useCallback, useState } from "react";
import {
  isDraftCraftFairApplication,
  isSubmittedCraftFairApplication,
  DraftCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";
import { getApplicationPaymentUrl } from "../services/ApplicationsManager";
import Spinner from "./Spinner";

type Appl<T extends DraftCraftFairApplication | SubmittedCraftFairApplication> =
  T extends DraftCraftFairApplication
    ? DraftCraftFairApplication
    : SubmittedCraftFairApplication;

export interface ApplicationListItemProps<
  T extends DraftCraftFairApplication | SubmittedCraftFairApplication
> {
  application: Appl<T>;
  clickHandler: (application: Appl<T>) => void;
  deleteHandler: (application: Appl<T>) => Promise<void>;
}

const ApplicationListItem = <
  T extends DraftCraftFairApplication | SubmittedCraftFairApplication
>({
  application,
  clickHandler,
  deleteHandler,
}: ApplicationListItemProps<T>): JSX.Element => {
  const [processing, setProcessing] = useState(false);

  const deleteClickHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      setProcessing(true);
      deleteHandler(application).finally(() => {
        setProcessing(false);
      });
    }, [application, deleteHandler]);

  const payClickHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      if (isSubmittedCraftFairApplication(application)) {
        setProcessing(true);
        getApplicationPaymentUrl(application).finally(() => {
          setProcessing(false);
        });
      }
    }, [application]);

  let timestampComponent;
  if (isDraftCraftFairApplication(application)) {
    timestampComponent = <span>Saved: {application.lastSaved}</span>;
  } else if (isSubmittedCraftFairApplication(application)) {
    timestampComponent = <span>Submitted: {application.created}</span>;
  }

  let statusComponent = null;
  let paymentComponent = null;
  let deleteComponent = null;

  if (isSubmittedCraftFairApplication(application)) {
    statusComponent = (
      <div className="p-2 bg-bfw-yellow">{application.status}</div>
    );

    if (
      application.status === "Submitted" ||
      application.status === "Pending Deposit"
    ) {
      deleteComponent = (
        <button
          onClick={deleteClickHandler}
          className="m-2 w-20 self-center bg-red-600 rounded-full"
        >
          Delete
        </button>
      );
    }

    if (
      application.status === "Pending Deposit" ||
      application.status === "Accepted Pending Payment"
    ) {
      paymentComponent = (
        <button
          onClick={payClickHandler}
          className="m-2 w-20 self-center bg-green-300 rounded-full"
        >
          Pay now
        </button>
      );
    }
  }

  let controlsComponent;
  if (processing) {
    controlsComponent = <Spinner size="sm" />;
  } else {
    controlsComponent = (
      <div className="flex flex-col text-center w-40">
        {statusComponent}
        {paymentComponent}
        {deleteComponent}
      </div>
    );
  }

  return (
    <div className="flex flex-row even:bg-yellow-50 odd:bg-yellow-100 hover:bg-yellow-200 first:rounded-t-lg last:rounded-b-lg">
      <div
        onClick={() => {
          if (!processing) clickHandler(application);
        }}
        className="flex-auto block p-2 cursor-pointer "
      >
        <span className="block">{application.tradingName}</span>
        <span className="block">{timestampComponent}</span>
        <span className="block">Total: £{application.totalCost}</span>
      </div>
      <div className="">{controlsComponent}</div>
    </div>
  );
};

export default ApplicationListItem;

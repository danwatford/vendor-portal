import { PropsWithChildren, useCallback, useState } from "react";
import { DateTime } from "luxon";
import {
  isDraftCraftFairApplication,
  isSubmittedCraftFairApplication,
  DraftCraftFairApplication,
  SubmittedCraftFairApplication,
  PitchType,
} from "../interfaces/Applications";
import { openApplicationPaymentUrl } from "../services/ApplicationsManager";
import Spinner from "./Spinner";

type EitherApplication =
  | DraftCraftFairApplication
  | SubmittedCraftFairApplication;

type ConditionalApplication<T extends EitherApplication> =
  T extends DraftCraftFairApplication
    ? DraftCraftFairApplication
    : SubmittedCraftFairApplication;

export interface ApplicationListItemProps<T extends EitherApplication> {
  application: ConditionalApplication<T>;
  clickHandler: (application: ConditionalApplication<T>) => void;
  deleteHandler: (application: ConditionalApplication<T>) => Promise<void>;
}

interface ApplicationControlsProps<T extends EitherApplication> {
  application: ConditionalApplication<T>;
  deleteClickedHander: React.MouseEventHandler<HTMLButtonElement>;
  payClickedHandler: React.MouseEventHandler<HTMLButtonElement>;
}

const ApplicationHeader = <T extends EitherApplication>({
  application,
  children,
}: PropsWithChildren<{
  application: ConditionalApplication<T>;
}>) => {
  const statusText = isSubmittedCraftFairApplication(application)
    ? application.status
    : "Draft";

  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow text-xs whitespace-nowrap">
        <div>Craft fair application</div>
        <div>{statusText}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const pitchDescriptions: Readonly<Record<PitchType, string>> = {
  standardNoShelter: "Standard 3m wide x 3m deep pitch / No shelter",
  extraLargeNoShelter: "Extra-large 4.5m wide x 3m deep pitch / No shelter",
  standardInMarquee: "Standard 3m wide x 3m deep pitch / Marquee",
  doubleInMarquee: "Double Width 6m wide x 3m deep pitch / Marquee",
};

const applicationPitchDescriptionComponents = (
  application: EitherApplication
) => {
  const retArray = [];

  retArray.push(
    <span className="block">{pitchDescriptions[application.pitchType]}</span>
  );

  if (
    application.pitchType === "standardNoShelter" ||
    application.pitchType === "extraLargeNoShelter"
  ) {
    retArray.push(
      <span className="block">
        Additional width (metres): {application.pitchAdditionalWidth}
      </span>
    );
  }

  if (application.pitchType === "extraLargeNoShelter") {
    retArray.push(<span className="block">Space for van required</span>);
  }

  if (application.campingRequired) {
    retArray.push(<span className="block">Camping (max 2 persons)</span>);
  }

  if (application.pitchElectricalOptions !== "none") {
    retArray.push(
      <span className="block">{application.pitchElectricalOptions}</span>
    );
  }

  if (application.tables) {
    retArray.push(<span className="block">{application.tables} table(s)</span>);
  }

  if (isSubmittedCraftFairApplication(application)) {
    if (application.depositAmount) {
      retArray.push(
        <span className="block">Deposit due: £{application.depositAmount}</span>
      );
    }
    if (application.depositAmountPaid) {
      retArray.push(
        <span className="block">
          Deposit paid: £{application.depositAmountPaid}
        </span>
      );
    }
  }

  return retArray;
};

const ApplicationInfo = <T extends EitherApplication>({
  application,
}: {
  application: ConditionalApplication<T>;
}) => {
  let timestampLabel;
  let dateTime: DateTime;
  if (isDraftCraftFairApplication(application)) {
    timestampLabel = "Saved";
    dateTime = DateTime.fromISO(application.lastSaved);
  } else {
    const submittedApplication = application as SubmittedCraftFairApplication;
    timestampLabel = "Submitted";
    dateTime = DateTime.fromISO(submittedApplication.created);
  }

  const timestampComponent = (
    <span className="text-sm">
      {timestampLabel} {dateTime.toLocaleString(DateTime.DATETIME_MED)}
    </span>
  );

  return (
    <>
      <span className="block font-bold">{application.tradingName}</span>
      <span className="block">{timestampComponent}</span>
      {applicationPitchDescriptionComponents(application)}
      <span className="block font-bold">Total: £{application.totalCost}</span>
    </>
  );
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

const ApplicationControls = <T extends EitherApplication>({
  application,
  deleteClickedHander,
  payClickedHandler,
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

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        {paymentComponent}
        {deleteComponent}
      </div>
    </>
  );
};

const ApplicationListItem = <T extends EitherApplication>({
  application,
  clickHandler,
  deleteHandler,
}: ApplicationListItemProps<T>): JSX.Element => {
  const [processing, setProcessing] = useState(false);

  const itemSelectedHandler = useCallback(() => {
    if (!processing) {
      clickHandler(application);
    }
  }, [application, clickHandler, processing]);

  const deleteClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        setProcessing(true);
        deleteHandler(application).finally(() => {
          setProcessing(false);
        });
      },
      [application, deleteHandler]
    );

  const payClickHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        if (isSubmittedCraftFairApplication(application)) {
          setProcessing(true);
          openApplicationPaymentUrl(application).finally(() => {
            setProcessing(false);
          });
        }
      },
      [application]
    );

  let controlsComponent;
  if (processing) {
    controlsComponent = <Spinner size="sm" />;
  } else {
    controlsComponent = (
      <div className="text-center">
        <ApplicationControls
          application={application}
          deleteClickedHander={deleteClickedHandler}
          payClickedHandler={payClickHandler}
        />
      </div>
    );
  }

  let actionRequiredComponent;
  if (isDraftCraftFairApplication(application)) {
    actionRequiredComponent = (
      <div>
        ACTION Required: When ready,{" "}
        <button onClick={itemSelectedHandler} className="underline">
          select this application to edit it
        </button>{" "}
        and then submit to Broadstairs Folk Week.
      </div>
    );
  }

  if (isSubmittedCraftFairApplication(application)) {
    if (
      application.status === "Submitted" ||
      application.status === "Pending Deposit"
    ) {
      actionRequiredComponent = (
        <div>
          ACTION Required:
          <button onClick={payClickHandler} className="mx-1 underline">
            Deposit payment
          </button>
          <br></br>
          It may take a few minutes for your deposit payment to show here.
          Please click refresh a few minutes after making your payment.
        </div>
      );
    }
  }

  return (
    <div
      onClick={() => itemSelectedHandler()}
      className="flex flex-col -mb-4 pb-4 even:ml-2 odd:mr-2 even:bg-yellow-50 odd:bg-yellow-100 hover:bg-yellow-200 rounded-lg overflow-hidden cursor-pointer"
    >
      <ApplicationHeader application={application}>
        {actionRequiredComponent}
      </ApplicationHeader>
      <div className="flex flex-row">
        <div className="flex-auto p-4">
          <ApplicationInfo application={application} />
        </div>
        <div className="py-4 pr-2 w-32">{controlsComponent}</div>
      </div>
    </div>
  );
};

export default ApplicationListItem;

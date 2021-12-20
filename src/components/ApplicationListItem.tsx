import { PropsWithChildren, useCallback, useState } from "react";
import {
  isDraftCraftFairApplication,
  isSubmittedCraftFairApplication,
  DraftCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";
import { openApplicationPaymentUrl } from "../services/ApplicationsManager";
import Spinner from "./Spinner";
import ApplicationListItemControls from "./ApplicationListItemControls";
import ApplicationListItemInfo from "./ApplicationListItemInfo";

type EitherApplication =
  | DraftCraftFairApplication
  | SubmittedCraftFairApplication;

type ConditionalApplication<T extends EitherApplication> =
  T extends DraftCraftFairApplication
    ? DraftCraftFairApplication
    : SubmittedCraftFairApplication;

export interface ApplicationListItemProps<T extends EitherApplication> {
  application: ConditionalApplication<T>;
  editApplication: (application: ConditionalApplication<T>) => void;
  deleteApplication: (application: ConditionalApplication<T>) => Promise<void>;
  uploadApplicationDocuments: (application: ConditionalApplication<T>) => void;
  completeApplication: (
    application: ConditionalApplication<T>
  ) => Promise<void>;
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

const ApplicationListItem = <T extends EitherApplication>({
  application,
  editApplication,
  deleteApplication,
  uploadApplicationDocuments,
  completeApplication,
}: ApplicationListItemProps<T>): JSX.Element => {
  const [processing, setProcessing] = useState(false);

  const itemSelectedHandler = useCallback(() => {
    if (!processing) {
      editApplication(application);
    }
  }, [application, editApplication, processing]);

  const editButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        editApplication(application);
      },
      [application, editApplication]
    );

  const deleteButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        setProcessing(true);
        deleteApplication(application).finally(() => {
          setProcessing(false);
        });
      },
      [application, deleteApplication]
    );

  const payButtonClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
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

  const uploadApplicationDocumentsClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        if (isSubmittedCraftFairApplication(application)) {
          setProcessing(true);
          uploadApplicationDocuments(application);
          setProcessing(false);
        }
      },
      [application, uploadApplicationDocuments]
    );

  const applicationCompleteClickedHandler: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      async (ev) => {
        // Stop event propagation since we also have a click handler on the whole ApplicationListItem component.
        ev.stopPropagation();

        if (isSubmittedCraftFairApplication(application)) {
          setProcessing(true);
          await completeApplication(application);
          setProcessing(false);
        }
      },
      [application, completeApplication]
    );

  let controlsComponent;
  if (processing) {
    controlsComponent = <Spinner size="sm" />;
  } else {
    controlsComponent = (
      <div className="text-center">
        <ApplicationListItemControls
          application={application}
          editButtonClicked={editButtonClickedHandler}
          deleteButtonClicked={deleteButtonClickedHandler}
          payButtonClicked={payButtonClickedHandler}
          uploadDocumentsButtonClicked={
            uploadApplicationDocumentsClickedHandler
          }
          applicationCompleteButtonClcked={applicationCompleteClickedHandler}
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
          <button onClick={payButtonClickedHandler} className="mx-1 underline">
            Deposit payment
          </button>
          <br></br>
          It may take a few minutes for your deposit payment to show here.
          Please click refresh a few minutes after making your payment.
        </div>
      );
    } else if (application.status === "Pending Document Upload") {
      actionRequiredComponent = (
        <div>
          <div>
            ACTION Required:{" "}
            <button
              onClick={uploadApplicationDocumentsClickedHandler}
              className="underline"
            >
              Upload supporting documents/images.
            </button>{" "}
            for your application.
          </div>
          <div>
            If you have already uploaded all required document, mark your{" "}
            <button
              onClick={uploadApplicationDocumentsClickedHandler}
              className="underline"
            >
              Application as Complete
            </button>{" "}
            so that Broadstairs Folk Week can process it.
          </div>
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
          <ApplicationListItemInfo application={application} />
        </div>
        <div className="py-4 pr-2 w-40">{controlsComponent}</div>
      </div>
    </div>
  );
};

export default ApplicationListItem;

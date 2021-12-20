import { DateTime } from "luxon";
import {
  DraftCraftFairApplication,
  isDraftCraftFairApplication,
  isSubmittedCraftFairApplication,
  PitchType,
  SubmittedCraftFairApplication,
} from "../interfaces/Applications";

type EitherApplication =
  | DraftCraftFairApplication
  | SubmittedCraftFairApplication;

type ConditionalApplication<T extends EitherApplication> =
  T extends DraftCraftFairApplication
    ? DraftCraftFairApplication
    : SubmittedCraftFairApplication;

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
    <span className="block" key={retArray.length}>
      {pitchDescriptions[application.pitchType]}
    </span>
  );

  if (
    application.pitchType === "standardNoShelter" ||
    application.pitchType === "extraLargeNoShelter"
  ) {
    retArray.push(
      <span className="block" key={retArray.length}>
        Additional width (metres): {application.pitchAdditionalWidth}
      </span>
    );
  }

  if (application.pitchType === "extraLargeNoShelter") {
    retArray.push(
      <span className="block" key={retArray.length}>
        Space for van required
      </span>
    );
  }

  if (application.campingRequired) {
    retArray.push(
      <span className="block" key={retArray.length}>
        Camping (max 2 persons)
      </span>
    );
  }

  if (application.pitchElectricalOptions !== "none") {
    retArray.push(
      <span className="block" key={retArray.length}>
        {application.pitchElectricalOptions}
      </span>
    );
  }

  if (application.tables) {
    retArray.push(
      <span className="block" key={retArray.length}>
        {application.tables} table(s)
      </span>
    );
  }

  if (isSubmittedCraftFairApplication(application)) {
    if (application.depositAmount) {
      retArray.push(
        <span className="block" key={retArray.length}>
          Deposit due: £{application.depositAmount}
        </span>
      );
    }
    if (application.depositAmountPaid) {
      retArray.push(
        <span className="block" key={retArray.length}>
          Deposit paid: £{application.depositAmountPaid}
        </span>
      );
    }
  }

  return retArray;
};

const ApplicationListItemInfo = <T extends EitherApplication>({
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

export default ApplicationListItemInfo;

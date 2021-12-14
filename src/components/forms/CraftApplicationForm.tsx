import { Field, Formik } from "formik";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import {
  isLocalCraftFairApplication,
  LocalCraftFairApplication,
  SubmittedCraftFairApplication,
} from "../../interfaces/Applications";
import {
  getTablesCost,
  getTotalCraftFairApplicationCost,
  pitchAdditionalWidthCost,
  pitchBaseCost,
  pitchEletricalOptionCost,
} from "../../services/applications-pricing";
import { saveCurrentDraftApplication } from "../../services/ApplicationsManager";
import {
  getCurrentEditingApplication,
  saveCurrentEditingApplication,
} from "../../services/LocalApplicationsStore";
import { useUserProfile } from "../../services/UserProfileContext";
import PageLayout from "../PageLayout";
import { AddressField, PitchSelection, TextArea, TextInput } from "./Fields";
import LocalPersist from "./LocalPersist";
import ScrollToFieldError from "./ScrollToFieldError";
import { CraftFairApplicationValidationSchema } from "./ValidationSchemas";

export interface CraftApplicationFormProps {
  initialValues: LocalCraftFairApplication | SubmittedCraftFairApplication;
}

const CraftApplicationForm: React.FC = () => {
  const [isError, setIsError] = useState<boolean>(false);
  const [errorDescription, setErrorDescription] = useState<string>("");

  const [initialValues] = useState<
    LocalCraftFairApplication | SubmittedCraftFairApplication | undefined
  >(() => {
    const currentApplication = getCurrentEditingApplication();
    if (!currentApplication) {
      setIsError(true);
      setErrorDescription(
        "Could not retrieve form to edit from local storage."
      );
      return;
    } else {
      return currentApplication;
    }
  });

  const { userProfile } = useUserProfile();
  const navigate = useNavigate();

  const saveDraftClickedHandler = useCallback(() => {
    saveCurrentDraftApplication();
    navigate("/");
  }, [navigate]);

  if (isError || !initialValues) {
    return (
      <PageLayout>
        <h1>Error editing application form</h1>
        {errorDescription}
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1 className="text-2xl font-black">Craft Fair Application Form</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object({
          ...CraftFairApplicationValidationSchema,
        })}
        onSubmit={(values, { setSubmitting }) => {
          if (userProfile) {
            navigate("/submittingCraftApplication");
            setSubmitting(false);
          } else {
            const postLoginRedirectUrl = new URL(
              "/submittingCraftApplication",
              document.location.href
            );

            const loginUrl = new URL("/api/login", document.location.href);
            loginUrl.searchParams.append(
              "postLoginRedirectUrl",
              postLoginRedirectUrl.href
            );

            window.location.assign(loginUrl.href);
          }
        }}
      >
        {(formik) => {
          const totalTablesCost = getTablesCost(formik.values);
          const totalCost = getTotalCraftFairApplicationCost(formik.values);

          const saveAsDraftComponent = isLocalCraftFairApplication(
            formik.values
          ) ? (
            <button
              type="button"
              onClick={saveDraftClickedHandler}
              className="m-4 underline"
            >
              Save as draft
            </button>
          ) : null;

          return (
            <form onSubmit={formik.handleSubmit} className={"text-left"}>
              <LocalPersist
                loadValuesFromStorage={getCurrentEditingApplication}
                saveValuesToStorage={saveCurrentEditingApplication}
              />

              <ScrollToFieldError />

              <h2 className="mt-4 text-2xl font-black">Trader Information</h2>
              <TextInput name="tradingName" label="Trading name" type="text" />

              <TextArea
                name="descriptionOfStall"
                label="Description of stall"
                description="Please give a full description of the items on sale at your stall. We
        will do our best to restrict the number of similar stalls. Please attach
        additional information if you have some available, especially photos of
        your normal stall. Please note that you might not be allowed to sell
        items that are not listed in this section"
              />

              <TextInput
                name="landline"
                label="Landline phone number"
                type="tel"
              />
              <TextInput name="mobile" label="Mobile phone number" type="tel" />

              <AddressField />

              <h2 className="mt-4 text-2xl font-black">Pitch selection</h2>
              <div className="ml-2">
                <h3 className="mt-2 text-xl font-black">
                  Supply your own shelter
                </h3>
                <div>
                  Shelters or gazebos must be secured down and be able to
                  withstand strong winds and rain. This site is on the cliff
                  top. Prices are for the full 7 days trading - please read the
                  Terms and Conditions
                </div>
                <PitchSelection
                  name="pitchType"
                  value="standardNoShelter"
                  price={pitchBaseCost["standardNoShelter"]}
                  label="Standard 3m wide x 3m deep pitch"
                  description="(approx. 10ft x 10ft)"
                  additionalWidthPerMetrePrice={
                    pitchAdditionalWidthCost["standardNoShelter"]
                  }
                  additionalWidthDescription="If you require a pitch width bigger 
                than 3m, you can add extra at 
                £140 per metre. "
                ></PitchSelection>
                <PitchSelection
                  name="pitchType"
                  value="extraLargeNoShelter"
                  price={pitchBaseCost["extraLargeNoShelter"]}
                  label="Extra-large 4.5m wide x 3m deep pitch"
                  description="(approx. 15ft x 10ft)"
                  description2="Vehicle space behind. No motorhomes or 
                caravans. Vehicles cannot be moved off site 
                during the week."
                  additionalWidthPerMetrePrice={
                    pitchAdditionalWidthCost["extraLargeNoShelter"]
                  }
                  additionalWidthDescription="If you require a pitch width bigger 
                than 3m, you can add extra at 
                £150 per metre. "
                  additionalWidthDescription2="VERY LIMITED NUMBER"
                  enableVanSpaceOption={true}
                />
              </div>

              <div className="ml-2">
                <h3 className="mt-2 text-xl font-black">Within a marquee</h3>
                <div>
                  We changed the layout in 2021 and no longer have a closed-in
                  marquee. Instead, our narrower marquees open outwards to the
                  public to reveal your shop front. Please bear this in mind
                  with regards to weather. Curtain sides will be in place for
                  traders to close overnight. Prices are for the Full 7 days
                  trading - please read the Terms and Conditions
                </div>
                <PitchSelection
                  name="pitchType"
                  value="standardInMarquee"
                  price={pitchBaseCost["standardInMarquee"]}
                  label="Standard 3m wide x 3m deep pitch"
                  description="(approx. 10ft x 10ft)"
                />
                <PitchSelection
                  name="pitchType"
                  value="doubleInMarquee"
                  price={pitchBaseCost["doubleInMarquee"]}
                  label="Double Width 6m wide x 3m deep pitch"
                  description="(approx. 20ft x 10ft)"
                  description2="Marquee support legs are every 3m"
                />
              </div>

              <h2 className="mt-4 text-2xl font-black">
                Camping and overnight stays
              </h2>
              <div>
                Camping and overnight stays at the Festival Campsite. There is
                no camping on the craft fair site (please book in advance).
                Campsite rules apply, all Campsite amenities will be open to
                you. We run a regular minibus service to and from the campsite.
              </div>
              <div className="mt-2">
                <label>
                  <Field
                    type="checkbox"
                    name="campingRequired"
                    className="mr-2"
                  />
                  Camping required, charged at £60 for the week (max 2 persons)
                </label>
              </div>

              <h2 className="mt-4 text-2xl font-black">
                Electricity Options for all stall holders
              </h2>
              <div>
                There is general overhead lighting around the site and in the
                open marquees which is supplied within your fee. Additional
                options are:
              </div>

              <PitchSelection
                name="pitchElectricalOptions"
                value="none"
                price={pitchEletricalOptionCost["none"]}
                label="No additional electricity supply required."
              ></PitchSelection>

              <PitchSelection
                name="pitchElectricalOptions"
                value="1 x 13amp socket"
                price={pitchEletricalOptionCost["1 x 13amp socket"]}
                label="1 x 13amp socket @ 1kw of power direct to your stall."
              ></PitchSelection>

              <PitchSelection
                name="pitchElectricalOptions"
                value="1 x 16amp socket"
                price={pitchEletricalOptionCost["1 x 16amp socket"]}
                label="1 x 16amp socket @ 1kw of power direct to your stall."
              ></PitchSelection>

              <PitchSelection
                name="pitchElectricalOptions"
                value="2 x 13amp socket"
                price={pitchEletricalOptionCost["2 x 13amp socket"]}
                label="2 x 13amp socket @ 1kw of power direct to your stall."
              ></PitchSelection>

              <PitchSelection
                name="pitchElectricalOptions"
                value="1 x 32amp supply"
                price={pitchEletricalOptionCost["1 x 32amp supply"]}
                label="1 x 32amp supply @ 1kw of power direct to your stall."
              ></PitchSelection>

              <div>
                You must have proof of PAT testing for your electrical
                equipment. Please see terms and conditions. We are no longer
                able to supply a light fitting for outside traders, if you
                require additional lighting you will need to supply your own,
                using either solar or that can be plugged into a 13amp socket.
                This will need to have a PAT certificate and with the correct IP
                rating. Power will be available from Friday 6th and will be
                supplied between the hours of 9.30am and 9.30pm.
              </div>

              <h2 className="mt-4 text-2xl font-black">Table hire</h2>
              <div>
                TABLES for hire 6ft x 2ft (No chairs supplied). Charged at £12
                per table for the week.
              </div>
              <div className="flex flex-row justify-between mt-2">
                <span>Tables required:</span>

                <Field name="tables" as="select">
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Field>
              </div>

              <div className="flex flex-row justify-between mt-2">
                <span>Cost for tables:</span> <span>£{totalTablesCost}</span>
              </div>

              <h2 className="mt-4 text-2xl font-black">Total cost</h2>
              <div className="flex flex-row justify-between mt-2">
                <span>Total cost for application</span>{" "}
                <span>£{totalCost}</span>
              </div>

              <h2 className="mt-4 text-2xl font-black">Next steps</h2>
              <div>
                Thank you for preparing an application for a craft or catering
                pitch at Broadstairs Folk Week.
              </div>

              <div className="mt-2">
                Once you are happy with the above application you can submit it
                to the Broadstairs Folk Week vendor portal by clicking the
                Submit button below.
              </div>

              {!userProfile ? (
                <div className="mt-2">
                  When you click the Submit button below you will be prompted to
                  sign in to the vendor portal. This is so we can store your
                  application against your username in our database. If you have
                  not already registered with the vendor portal, you will be
                  able to do so during the submit process.
                </div>
              ) : null}

              <div className="mt-2">
                Once your application has been submitted to the vendor portal,
                you will be provided with a payment link so you can pay the
                deposit fee required for all applications.
              </div>

              <div className="mt-2">
                If you need to provide any photos or supporting documentation
                for your application, you will be able to do so once the
                application has been submitted to the vendor portal and the
                deposit fee has been paid.
              </div>

              <button
                type="submit"
                className="block m-auto my-4 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text"
              >
                Submit Craft Fair Application
              </button>

              {saveAsDraftComponent}
            </form>
          );
        }}
      </Formik>
    </PageLayout>
  );
};

export default CraftApplicationForm;

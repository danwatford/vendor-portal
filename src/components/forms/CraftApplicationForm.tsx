import { Formik } from "formik";
import * as Yup from "yup";
import { TextArea, TextInput } from "./Fields";
import LocalPersist from "./LocalPersist";

const CraftApplicationForm = () => {
  return (
    <>
      <h1 className="text-2xl font-black">Craft Fair Application Form</h1>
      <Formik
        initialValues={{
          stallholderName: "",
          tradingAs: "",
          address: "",
          postcode: "",
          landline: "",
          mobile: "",
          email: "",
          descriptionOfStall: "",
        }}
        validationSchema={Yup.object({
          stallholderName: Yup.string().required("Required"),
          tradingAs: Yup.string().required("Required"),
          address: Yup.string().required("Required"),
          postcode: Yup.string().required("Required"),
          email: Yup.string()
            .email("Invalid email address")
            .required("Required"),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit} className={"text-left"}>
            <LocalPersist storageKey="craftApplication" />
            <TextInput
              name="stallholderName"
              label="Name of stallholder"
              type="text"
            />
            <TextInput name="tradingAs" label="Trading as" type="text" />
            <TextArea name="address" label="Address" />
            <TextInput name="postcode" label="Postcode" type="text" />

            <button type="submit" disabled={formik.isSubmitting}>
              Submit Button
            </button>
          </form>
        )}
      </Formik>
    </>
  );
};

export default CraftApplicationForm;

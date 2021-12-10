import * as Yup from "yup";

export const CraftFairApplicationValidationSchema = {
  tradingName: Yup.string().required("Required"),
  descriptionOfStall: Yup.string().required("Required"),
  addressLine1: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  postcode: Yup.string().required("Required"),
  country: Yup.string().required("Required"),
  landline: Yup.string(),
  mobile: Yup.string(),
};

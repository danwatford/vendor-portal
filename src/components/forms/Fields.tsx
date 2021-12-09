import { Field, useField, useFormikContext } from "formik";
import { CraftFairApplication } from "../../interfaces/Applications";

const labelClassNames = "";
const baseTextFieldClassNames =
  "block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ";
const singletextFieldClassNames = baseTextFieldClassNames + " rounded-md mt-1";

interface InputProps {
  name: string;
  label: string;
  description?: string;
  description2?: string;
}

export interface TextInputProps extends InputProps {
  type: string;
  step?: string;
  min?: string;
  max?: string;
}

export interface TextAreaProps extends InputProps {}

export interface PitchSelectionProps extends InputProps {
  value: string;
  price: number;
  additionalWidthPerMetrePrice?: number;
  additionalWidthDescription?: string;
  additionalWidthDescription2?: string;
  enableVanSpaceOption?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  description,
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <>
      <div className="flex flex-row justify-between mt-2">
        <label htmlFor={name} className={labelClassNames}>
          {label}
        </label>
        {meta.touched && meta.error ? (
          <span className="text-red-500">{meta.error}</span>
        ) : null}
      </div>
      {description && <div>{description}</div>}
      <input {...field} {...props} className={singletextFieldClassNames} />
    </>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  label,
  description,
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <>
      <div className="flex flex-row justify-between mt-2">
        <label htmlFor={name} className={labelClassNames}>
          {label}
        </label>
        {meta.touched && meta.error ? (
          <span className="text-red-500">{meta.error}</span>
        ) : null}
      </div>
      {description && (
        <div className="px-2 font-extralight text-left">{description}</div>
      )}
      <textarea
        {...field}
        {...props}
        rows={5}
        className={singletextFieldClassNames}
      />
    </>
  );
};

export const AddressField = () => {
  const { values, touched, errors, handleChange, handleBlur } =
    useFormikContext<CraftFairApplication>();
  return (
    <>
      <div className="flex flex-row justify-between mt-2">
        <label htmlFor="addressLine1" className={labelClassNames}>
          Address
        </label>
        {touched.addressLine1 && errors.addressLine1 ? (
          <span className="text-red-500">{errors.addressLine1}</span>
        ) : null}
      </div>
      <input
        name="addressLine1"
        type="text"
        value={values.addressLine1}
        onChange={handleChange}
        onBlur={handleBlur}
        className={baseTextFieldClassNames + " rounded-t-md"}
      />
      <input
        name="addressLine2"
        type="text"
        value={values.addressLine2}
        onChange={handleChange}
        onBlur={handleBlur}
        className={baseTextFieldClassNames + " rounded-b-md"}
      />
      <TextInput name="city" label="Town/City" type="text" />
      <TextInput name="state" label="County/State" type="text" />
      <TextInput name="postcode" label="Postcode" type="text" />
      <TextInput name="country" label="Country" type="text" />
    </>
  );
};

export const PitchSelection: React.FC<PitchSelectionProps> = ({
  name,
  label,
  value,
  price,
  description,
  description2,
  additionalWidthPerMetrePrice,
  additionalWidthDescription,
  additionalWidthDescription2,
  enableVanSpaceOption,
  children,
}) => {
  const { values } = useFormikContext<CraftFairApplication>();
  const [field] = useField(name);

  const totalPitchCost =
    price +
    (additionalWidthPerMetrePrice
      ? additionalWidthPerMetrePrice * values.pitchAdditionalWidth
      : 0);

  return (
    <>
      <div className="flex flex-row justify-between mt-2">
        <label className={labelClassNames}>
          <Field type="radio" name={name} value={value} className="mx-2" />
          {label}
        </label>

        <span className="">£{price}</span>
      </div>
      {description && (
        <div className="ml-6 px-2 text-sm font-extralight text-left">
          {description}
        </div>
      )}

      {description2 && (
        <div className="ml-6 px-2 font-extralight text-left">
          {description2}
        </div>
      )}

      <div className="ml-10 mt-2">
        {field.value === value && (
          <>
            {additionalWidthPerMetrePrice ? (
              <>
                <div>{additionalWidthDescription2}</div>
                <div>{additionalWidthDescription}</div>

                <div className="flex flex-row justify-between mt-2">
                  <span>Additional width (metres)</span>
                  <Field name="pitchAdditionalWidth" as="select">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </Field>
                </div>
              </>
            ) : null}

            {enableVanSpaceOption ? (
              <>
                <label>
                  <Field
                    type="checkbox"
                    name="pitchVanSpaceRequired"
                    className="mr-2"
                  />
                  Space for van required
                </label>
              </>
            ) : null}

            {additionalWidthPerMetrePrice ? (
              <div className="flex flex-row justify-between mt-2">
                <span>Total pitch cost:</span> <span>£{totalPitchCost}</span>
              </div>
            ) : null}
            {children}
          </>
        )}
      </div>
    </>
  );
};

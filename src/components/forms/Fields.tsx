import { useField } from "formik";

const labelClassNames = "";
const textFieldClassNames =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50";

interface InputProps {
  name: string;
  label: string;
}

export interface TextInputProps extends InputProps {
  type: string;
}

export interface TextAreaProps extends InputProps {}

export const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
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
      <input {...field} {...props} className={textFieldClassNames} />
    </>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  label,
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
      <textarea {...field} {...props} className={textFieldClassNames} />
    </>
  );
};

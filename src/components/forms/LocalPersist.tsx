import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import isEqual from "react-fast-compare";
import { useDebouncedCallback } from "use-debounce";

export interface FormikPersistProps {
  storageKey: string;
}

const LocalPersist: React.FC<FormikPersistProps> = <T,>(
  props: FormikPersistProps
) => {
  const { values, setValues } = useFormikContext<T>();
  const prefValuesRef = useRef<T>();

  useEffect(() => {
    const savedForm = window.localStorage.getItem(props.storageKey);

    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);

      prefValuesRef.current = parsedForm;
      setValues(parsedForm);
    }
  }, [props.storageKey, setValues]);

  const onSave = (values: T) => {
    window.localStorage.setItem(props.storageKey, JSON.stringify(values));
  };

  const debouncedOnSave = useDebouncedCallback(onSave, 300);

  useEffect(() => {
    if (!isEqual(prefValuesRef.current, values)) {
      debouncedOnSave(values);
    }
  });

  useEffect(() => {
    prefValuesRef.current = values;
  });

  return null;
};

export default LocalPersist;

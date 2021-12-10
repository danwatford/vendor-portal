import { PropsWithChildren, useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import isEqual from "react-fast-compare";
import { useDebouncedCallback } from "use-debounce";

export interface FormikPersistProps<T> {
  loadValuesFromStorage: () => T | null;
  saveValuesToStorage: (values: T) => void;
}

function LocalPersist<T>({
  loadValuesFromStorage,
  saveValuesToStorage,
}: PropsWithChildren<FormikPersistProps<T>>) {
  const { values, setValues } = useFormikContext<T>();
  const prefValuesRef = useRef<T>();

  useEffect(() => {
    const savedForm = loadValuesFromStorage();

    if (savedForm) {
      setValues(savedForm);
    }
  }, [loadValuesFromStorage, setValues]);

  const onSave = (values: T) => {
    saveValuesToStorage(values);
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
}

export default LocalPersist;

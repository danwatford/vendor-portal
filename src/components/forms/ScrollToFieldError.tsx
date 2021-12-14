import { FormikErrors, useFormikContext } from "formik";
import { useEffect, useState } from "react";

function transformObjectToDotNotation(
  obj: any,
  prefix: string,
  results: string[]
): void {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (!value) {
      return;
    }

    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object") {
      transformObjectToDotNotation(value, nextKey, results);
    } else {
      results.push(nextKey);
    }
  });
}

function getFieldErrorNames<T>(formikErrors: FormikErrors<T>) {
  const results: string[] = [];
  transformObjectToDotNotation(formikErrors, "", results);
  return results;
}

function ScrollToFieldError<T>() {
  const { submitCount, isValid, errors } = useFormikContext<T>();
  const [lastSubmitCount, setLastSubmitCount] = useState(submitCount);

  useEffect(() => {
    if (submitCount === lastSubmitCount) {
      return;
    } else {
      setLastSubmitCount(submitCount);
    }

    if (isValid) {
      return;
    }

    const fieldErrorNames = getFieldErrorNames(errors);
    if (fieldErrorNames.length <= 0) return;

    const element = document.querySelector(
      `input[name='${fieldErrorNames[0]}']`
    );
    if (!element) return;

    // Scroll to first known error into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [submitCount, lastSubmitCount, isValid, errors]);

  return null;
}

export default ScrollToFieldError;

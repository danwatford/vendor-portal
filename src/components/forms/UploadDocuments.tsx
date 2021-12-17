import { Formik } from "formik";
import { ChangeEventHandler, useState } from "react";
// import { useApplications } from "../../services/ApplicationsContext";
import PageLayout from "../PageLayout";

export interface UploadDocumentProps {}

type FormValues = {
  file: File | null;
};

const UploadDocuments: React.FC<UploadDocumentProps> = () => {
  // const { currentApplication } = useApplications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialValues: FormValues = {
    file: null,
  };

  return (
    <PageLayout>
      <h1 className="text-2xl font-black">
        Upload supporting files for you application
      </h1>
      <div className="p-2 text-left">
        <div className="mt-2">
          Use the buttons below to choose images and/or documents on your device
          to be uploaded as part of your application.
        </div>
        <div className="mt-2">
          This page shows a summary of any files already uploaded.
        </div>
        <div className="mt-2">
          Once all files needed to support your application have been uploaded,
          click the All Uploads Complete button below. This will pass your
          application to the Broadstairs Folk Week team for processing.
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          if (selectedFile) {
            alert(
              JSON.stringify(
                {
                  fileName: selectedFile.name,
                  type: selectedFile.type,
                  size: `${selectedFile.size} bytes`,
                },
                null,
                2
              )
            );
          } else {
            alert("None");
          }
        }}
      >
        {(formik) => {
          const fileChangeHandler: ChangeEventHandler<HTMLInputElement> = (
            ev
          ) => {
            const targetFiles = ev.currentTarget?.files;
            if (!targetFiles) {
              setSelectedFile(null);
            } else {
              const targetFile: File = targetFiles[0];
              setSelectedFile(targetFile);
            }
          };

          return (
            <form onSubmit={formik.handleSubmit} className="p-2 text-left">
              <div>
                {selectedFile === null
                  ? "Selected file IS null"
                  : "Selected file NOT null"}
              </div>
              <label htmlFor="file">File upload</label>
              <div className="w-full p-2 border-2 border-gray-300 shadow-sm">
                <input
                  id="file"
                  name="file"
                  type="file"
                  onChange={fileChangeHandler}
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedFile}
                className="block m-auto my-4 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text"
              >
                Upload file
              </button>
            </form>
          );
        }}
      </Formik>
    </PageLayout>
  );
};

export default UploadDocuments;

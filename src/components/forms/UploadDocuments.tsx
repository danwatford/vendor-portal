import { ChangeEventHandler, useCallback, useState } from "react";
import { useApplications } from "../../services/ApplicationsContext";
import PageLayout from "../PageLayout";

export interface UploadDocumentProps {}

const UploadDocuments: React.FC<UploadDocumentProps> = () => {
  const { currentApplication } = useApplications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadFileClickedHandler = useCallback(() => {
    if (selectedFile && currentApplication) {
      const formData = new FormData();
      formData.append("uploadFile", selectedFile);
      formData.append("dbId", "" + currentApplication.dbId);

      fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          console.log("Upload response", response);
        })
        .catch((err) => console.error("Error uploading file", err));
    }
  }, [selectedFile, currentApplication]);

  const fileChangedHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      const targetFiles = ev.currentTarget?.files;
      if (!targetFiles) {
        setSelectedFile(null);
      } else {
        const targetFile: File = targetFiles[0];
        setSelectedFile(targetFile);
      }
    },
    []
  );

  if (!currentApplication) {
    return null;
  }

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

      <div>
        <div className="w-full p-2 border-2 border-gray-300 shadow-sm text-left">
          <input
            id="file"
            name="file"
            type="file"
            onChange={fileChangedHandler}
            className="form-control"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedFile}
          onClick={uploadFileClickedHandler}
          className={`block m-auto my-4 p-4 w-80 ${
            selectedFile ? "bg-bfw-yellow hover:bg-bfw-link" : "bg-gray-200"
          } rounded text-lg text-menu-text`}
        >
          {selectedFile
            ? "Upload file"
            : "Please select the Choose File button"}
        </button>
      </div>
    </PageLayout>
  );
};

export default UploadDocuments;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitCurrentCraftApplication } from "../services/ApplicationsManager";
import PageLayout from "./PageLayout";
import Spinner from "./Spinner";

export interface WelcomeProps {}

const SubmittingCraftApplication: React.FC<WelcomeProps> = () => {
  const navigate = useNavigate();

  useEffect(() => {
    submitCurrentCraftApplication()
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Error when submitting application", err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <PageLayout>
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="my-10 text-2xl text-center">
          Submitting your application...
        </h1>
        <Spinner />
        <div className="flex-grow" />
      </div>
    </PageLayout>
  );
};

export default SubmittingCraftApplication;

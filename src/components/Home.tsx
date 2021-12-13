import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { prepareNewDraft } from "../services/LocalApplicationsStore";
import { useUserProfile } from "../services/UserProfileContext";
import ApplicationsList from "./ApplicationsList";
import DraftApplicationsList from "./DraftApplicationsList";
import HomeLayout from "./HomeLayout";

export interface WelcomeProps {}

const Home: React.FC<WelcomeProps> = () => {
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();

  const newCraftApplicationHandler = useCallback(() => {
    if (prepareNewDraft()) {
      navigate("/craftApplication");
    }
  }, [navigate]);

  if (userProfile) {
    return (
      <HomeLayout>
        <div className="space-y-2 text-left">
          <h1 className="text-2xl text-center">
            Welcome to the Broadstairs Folk Week Vendor Portal
          </h1>
          <p>
            Please use this website to apply for a pitch at Broadstairs Folk
            Week 2022.
          </p>
        </div>
        <div className="text-left">
          <h2 className="mt-4 text-xl ">Existing applications</h2>
          <ApplicationsList />
        </div>
        <div className="text-left">
          <h2 className="mt-4 text-xl ">
            Draft applications stored on this device
          </h2>
          <DraftApplicationsList />
        </div>
        <div className="mt-8">
          <button
            type="button"
            onClick={newCraftApplicationHandler}
            className="m-4 underline"
          >
            New Craft Fair Application
          </button>

          <Link to="/cateringApplication" className="m-4 underline">
            Catering Application
          </Link>
        </div>
      </HomeLayout>
    );
  } else {
    return (
      <HomeLayout>
        <div className="space-y-2 text-left">
          <h1 className="text-2xl text-center">
            Welcome to the Broadstairs Folk Week Vendor Portal
          </h1>
          <p>
            Please use this website to apply for a pitch at Broadstairs Folk
            Week 2022.
          </p>
          <p>
            Sign in to see the progress of your current applications, or create
            a new application by selecting the links below.
          </p>
        </div>
        <div className="text-left">
          <h2 className="mt-4 text-xl ">
            Draft applications stored on this device
          </h2>
          <DraftApplicationsList />
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={newCraftApplicationHandler}
            className="m-4 underline"
          >
            New Craft Fair Application
          </button>
          <Link to="/cateringApplication" className="m-4 underline">
            Catering Application
          </Link>
        </div>
      </HomeLayout>
    );
  }
};

export default Home;

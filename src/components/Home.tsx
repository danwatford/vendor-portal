import { Link } from "react-router-dom";
import { useUserProfile } from "../services/UserProfileContext";
import ApplicationsList from "./ApplicationsList";
import HomeLayout from "./HomeLayout";

export interface WelcomeProps {}

const Welcome: React.FC<WelcomeProps> = () => {
  const { userProfile } = useUserProfile();

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
        <div className="mt-8">
          <Link to="/craftApplication" className="m-4 underline">
            Craft Fair Application
          </Link>
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
        <div className="mt-8">
          <Link to="/craftApplication" className="m-4 underline">
            Craft Fair Application
          </Link>
          <Link to="/cateringApplication" className="m-4 underline">
            Catering Application
          </Link>
        </div>
      </HomeLayout>
    );
  }
};

export default Welcome;

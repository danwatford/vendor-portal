import { DefaultButton } from "@fluentui/react";
import HomeLayout from "./HomeLayout";

export interface WelcomeProps {
  createCraftApplicationClickedHandler: () => void;
  createCateringApplicationClickedHandler: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({
  createCraftApplicationClickedHandler,
  createCateringApplicationClickedHandler,
}) => {
  return (
    <HomeLayout>
      <div className="space-y-2 text-left">
        <h1 className="text-2xl text-center">
          Welcome to the Broadstairs Folk Week Vendor Portal
        </h1>
        <p>
          Please use this website to apply for a pitch at Broadstairs Folk Week
          2022.
        </p>
        <p>
          Sign in to see the progress of your current applications, or create a
          new application by clicking on the buttons below.
        </p>
      </div>
      <div className="mt-2">
        <DefaultButton
          className="m-1 p-1 w-48"
          text="Craft Fair Application"
          onClick={createCraftApplicationClickedHandler}
        />
        <DefaultButton
          className="m-1 p-1 w-48"
          text="Catering Application"
          onClick={createCateringApplicationClickedHandler}
        />
      </div>
    </HomeLayout>
  );
};

export default Welcome;

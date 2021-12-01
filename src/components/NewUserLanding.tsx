import { StaticWebAuthLogins } from "@aaronpowell/react-static-web-apps-auth";

const NewUserLanding: React.FC = (props) => {
  return (
    <>
      <h1>Welcome to the Broadstairs Folk Week Vendors Portal</h1>
      <p>
        To create a Vendor account, please sign in with one of the buttons
        below.
      </p>
      <StaticWebAuthLogins
        azureAD={true}
        facebook={true}
        twitter={true}
        google={true}
        label={(name) => `${name} Sign In`}
      />
    </>
  );
};

export default NewUserLanding;

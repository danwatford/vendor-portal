// import { useClientPrincipal } from "@aaronpowell/react-static-web-apps-auth";

const Welcome: React.FC = () => {
  // const { loaded: clientPrincipalLoaded, clientPrincipal } =
  //   useClientPrincipal();

  return (
    <div className="px-2 space-y-2 text-left">
      <h1 className="text-2xl text-center">
        Welcome to the Broadstairs Folk Week Vendor Portal
      </h1>
      <p>
        Please use this website to apply to trade at Broadstairs Folk Week 2022.
      </p>
      <p>
        Sign in to see the progress of your applications, or create a new
        application by clicking on the buttons below.
      </p>
    </div>
  );
};

export default Welcome;

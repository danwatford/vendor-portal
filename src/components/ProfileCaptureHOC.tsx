import { useClientPrincipal } from "@aaronpowell/react-static-web-apps-auth";

export interface ProfileCaptureHO {}

const ProfileCaptureHOC: React.FC<ProfileCaptureHO> = ({ children }) => {
  const { loaded: clientPrincipalLoaded, clientPrincipal } =
    useClientPrincipal();

  if (clientPrincipalLoaded) {
    if (clientPrincipal) {
      return <>More details placeholder</>;
    } else {
      return <>{children}</>;
    }
  } else {
    return <div>Checking authentication...</div>;
  }
};

export default ProfileCaptureHOC;

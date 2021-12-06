import { useUserProfile } from "../services/UserProfileContext";
import Logout from "./Logout";
import styles from "./Header.module.scss";
import SignIn from "./SignIn";

const Header: React.FC = () => {
  const { loaded, userProfile } = useUserProfile();

  let authPanel = null;

  if (loaded) {
    if (userProfile) {
      authPanel = <Logout />;
    } else {
      authPanel = <SignIn />;
    }
  } else {
    authPanel = <p>Checking authentication...</p>;
  }

  return (
    <div className="flex flex-col bg-bfw-yellow">
      <div className="mx-4 my-1 h-32 bg-header-logo bg-contain bg-no-repeat bg-center"></div>
      <div className="flex-grow p-1">
        <h1 className="text-4xl">Vendor Portal</h1>
        <p>Apply for craft fair and catering pitches.</p>
      </div>
      <div className="flex flex-col p-1">
        <div className={styles.AuthPanel}>{authPanel}</div>
      </div>
    </div>
  );
};

export default Header;

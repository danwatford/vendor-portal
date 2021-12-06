import { useUserProfile } from "../services/UserProfileContext";
import styles from "./Header.module.scss";

const Header: React.FC = () => {
  const { loaded, userProfile } = useUserProfile();

  let authPanel = null;

  if (loaded) {
    if (userProfile) {
      authPanel = (
        <a className="m-1 p-1 text-bfw-link" href="/api/logout">
          Sign Out {userProfile.displayName}
        </a>
      );
    } else {
      authPanel = (
        <a className="m-1 p-1 text-bfw-link" href="/api/login">
          Sign In or Create Account
        </a>
      );
    }
  } else {
    authPanel = <p className="text-bfw-link">Checking authentication...</p>;
  }

  return (
    <div className="flex flex-col bg-bfw-yellow">
      <div className="flex flex-col p-1 bg-black text-right">
        <div className={styles.AuthPanel}>{authPanel}</div>
      </div>
      <div className="mx-4 my-1 h-32 bg-header-logo bg-contain bg-no-repeat bg-center"></div>
      <div className="flex-grow p-1">
        <h1 className="text-4xl font-black">Vendor Portal</h1>
        <p>Apply for craft fair and catering pitches.</p>
      </div>
    </div>
  );
};

export default Header;

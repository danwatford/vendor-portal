import { cleanEnv, str, url } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    TENANT_ID: str(),
    CLIENT_ID: str(),
    CLIENT_SECRET: str(),
    SITE_URL: url(),
  });
};

export default validateEnv;

import { DefaultButton } from "@fluentui/react";

const SignIn: React.FC = () => {
  return (
    <>
      <h2>Sign in or create an account</h2>
      <div>
        <DefaultButton text="Sign In" href="/api/login" />
      </div>
    </>
  );
};

export default SignIn;

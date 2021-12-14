import { User } from "../interfaces/user";

// Check that the minimal required field for a User are populated.
export const isUserValid = (user: User | null): boolean => {
  return (
    !!user &&
    !!user.userId &&
    !!user.email &&
    !!user.displayName &&
    !!user.firstName &&
    !!user.lastName
  );
};

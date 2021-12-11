import { User } from "../interfaces/user";
import {
  getUser as spGetUser,
  createUserListItem,
  updateUserListItem,
} from "./users-sp";
import { isUserValid } from "./users-validate";

export const createOrUpdateUser = async (user: User): Promise<User> => {
  const userId = user.userId;

  const existingUser = await getUserWithoutValidation(userId);
  if (existingUser) {
    const mergedUser: User = {
      ...existingUser,
      ...user,
      dbId: existingUser.dbId,
    };
    return updateUserListItem(mergedUser);
  } else {
    return createUserListItem(user);
  }
};

export const getUser = async (userId: string): Promise<User> => {
  const user = await getUserWithoutValidation(userId);
  return isUserValid(user) ? user : undefined;
};

const getUserWithoutValidation = async (userId: string): Promise<User> => {
  return spGetUser(userId);
};

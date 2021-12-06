import { Cookie } from "@azure/functions";
import { parse } from "cookie";
import { createHmac } from "crypto";
import { UserListItem } from "../interface/SpListItems";
import { User } from "../interface/user";
import { applyToItemsByFilter, createItem, updateItem } from "./Sp";

const vendorSiteUrl: string = process.env.VENDORS_SITE;
const vendorContactsListGuid: string = process.env.VENDORS_CONTACTS_LIST_GUID;

const MAX_COOKIE_AGE_SECONDS = 60 * 60 * 12;

export const createExpiredUserCookie = (): Cookie => {
  return {
    name: "vendorPortalUser",
    value: null,
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
    maxAge: 0,
  };
};

export const createUserCookie = (userId: string, user: User): Cookie => {
  const userCookieContent = Buffer.from(
    JSON.stringify({
      userId,
      user,
    })
  ).toString("base64");

  const hmac = createHmac("sha256", process.env.COOKIE_SECRET);
  hmac.update(userCookieContent);
  const hash = hmac.digest("hex");

  return {
    name: "vendorPortalUser",
    value: hash + ":" + userCookieContent,
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
    maxAge: MAX_COOKIE_AGE_SECONDS,
  };
};

const userFromCookie = (cookieValue: string): [userId: string, user: User] => {
  if (!cookieValue) {
    return [null, null];
  }

  const [hash, base64EncodedValue] = cookieValue.split(":", 2);
  if (!hash || !base64EncodedValue) {
    return [null, null];
  }

  const hmac = createHmac("sha256", process.env.COOKIE_SECRET);
  hmac.update(base64EncodedValue);
  const calculatedHash = hmac.digest("hex");

  if (hash === calculatedHash) {
    const { userId, user } = JSON.parse(
      Buffer.from(base64EncodedValue, "base64").toString()
    );
    return [userId, user];
  } else {
    return null;
  }
};

export const createOrUpdateUser = async (user: User): Promise<User> => {
  const userId = user.userId;

  const existingUser = await getUserWithoutValidation(userId);
  if (existingUser) {
    const mergedUser: User = {
      ...existingUser,
      ...user,
      dbId: existingUser.dbId,
    };
    return updateUser(mergedUser);
  } else {
    return createUser(user);
  }
};

export const getUser = async (userId: string): Promise<User> => {
  const user = await getUserWithoutValidation(userId);
  return isUserValid(user) ? user : undefined;
};

const getUserWithoutValidation = async (userId: string): Promise<User> => {
  const users = await getUsersByFilters(`UserId eq '${userId}'`);
  if (users?.length) {
    return users[0];
  } else {
    return undefined;
  }
};

// If we have a user id included in a cookie, use it to look up the user's profile.
// If the minimum profile fields that are populated by the identity provider are present
// then we can consider the user identified.
export const getUserFromCookie = async (cookie: string): Promise<User> => {
  if (cookie) {
    const cookies = parse(cookie);
    const vendorPortalUserCookie = cookies.vendorPortalUser;
    const [_, user] = userFromCookie(vendorPortalUserCookie);
    if (isUserValid(user)) {
      return user;
    }
  }
  return undefined;
};

const createUser = async (user: User): Promise<User> => {
  const addResult = await createItem<UserListItem>(
    vendorSiteUrl,
    vendorContactsListGuid,
    userToListItem(user)
  );
  return listItemToUser(addResult.data);
};

const updateUser = async (user: User): Promise<User> => {
  const listItem = userToListItem(user);
  await updateItem(vendorSiteUrl, vendorContactsListGuid, listItem);
  return user;
};

const getUsersByFilters = async (filter?: string): Promise<User[]> => {
  return applyToItemsByFilter<UserListItem, User[]>(
    vendorSiteUrl,
    vendorContactsListGuid,
    (items: UserListItem[]) => {
      return Promise.resolve(
        items.map((item) => {
          return {
            userId: item.UserId,
            identityProvider: item.IdentityProvider,
            email: item.ContactEmail,
            firstName: item.ContactFirstName,
            lastName: item.ContactLastName,
            displayName: item.Title,
            dbId: item.ID,
          };
        })
      );
    },
    filter
  );
};

// Check that the minimal required field for a User are populated.
const isUserValid = (user: User): boolean => {
  return (
    !!user &&
    !!user.userId &&
    !!user.email &&
    !!user.displayName &&
    !!user.firstName &&
    !!user.lastName
  );
};

const listItemToUser = (item: UserListItem): User => {
  return {
    userId: item.UserId,
    identityProvider: item.IdentityProvider,
    email: item.ContactEmail,
    firstName: item.ContactFirstName,
    lastName: item.ContactLastName,
    displayName: item.Title,
    dbId: item.ID,
  };
};

const userToListItem = (user: User): UserListItem => {
  return {
    ID: user.dbId,
    Title: user.displayName,
    UserId: user.userId,
    IdentityProvider: user.identityProvider,
    ContactEmail: user.email,
    ContactFirstName: user.firstName,
    ContactLastName: user.lastName,
  };
};

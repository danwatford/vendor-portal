export interface ListItem {
  ID?: number;
  Title: string;
}

export interface UserListItem extends ListItem {
  UserId: string;
  IdentityProvider: string;
  ContactFirstName: string;
  ContactLastName: string;
  ContactEmail: string;
}

export type MetadataItem = {
  key: string;
  value: string;
};

export type Billing = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

export type Fee = {
  name: string;
  total: string;
};

export type PersistableOrder = {
  billing: Billing;
  fee_lines: Fee[];
  currency: string;
  meta_data: MetadataItem[];
};

export type PersistedOrder = PersistableOrder & {
  id: number;
  number: number;
  order_key: string;
  created_via: string;
  status: string;
};

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
  isDefault?: boolean;
  index?: number;
}

export interface IAddressUpdate {
  addressIndex: number;
  address: Partial<IAddress>;
} 